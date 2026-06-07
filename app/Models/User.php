<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'avatar', 'avatar_type', 'social_provider', 'social_provider_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements FilamentUser
{
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class);
    }

    public function feedbackMessages(): HasMany
    {
        return $this->hasMany(FeedbackMessage::class);
    }

    public function scoreboards(): BelongsToMany
    {
        return $this->belongsToMany(Scoreboard::class, 'users_has_scoreboards')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function ownedPredictionGroups(): HasMany
    {
        return $this->hasMany(Scoreboard::class, 'owner_id');
    }

    public function scoreboardPredictions(): HasManyThrough
    {
        return $this->hasManyThrough(
            ScoreboardPrediction::class,
            Prediction::class,
            'user_id',
            'prediction_id',
            'id',
            'id',
        );
    }

    public function predictionGroups(): BelongsToMany
    {
        return $this->scoreboards();
    }

    public function avatarUrl(): ?string
    {
        $avatar = $this->getAttribute('avatar');

        if (blank($avatar)) {
            return null;
        }

        return Str::startsWith($avatar, ['http://', 'https://'])
            ? $avatar
            : Storage::url($avatar);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            && $this->hasAnyRole(['admin', 'super_admin'])
            && $this->hasEnabledTwoFactorAuthentication();
    }
}
