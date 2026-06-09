<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'predictions_visibility',
    'default_prediction_visibility',
    'show_on_leaderboards',
    'allow_group_visibility',
])]
class UserPreference extends Model
{
    protected function casts(): array
    {
        return [
            'show_on_leaderboards' => 'boolean',
            'allow_group_visibility' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPrivate(): bool
    {
        return $this->predictions_visibility === 'private';
    }

    public function isPublic(): bool
    {
        return $this->predictions_visibility === 'public';
    }

    public function predictionsArePublic(): bool
    {
        return $this->predictions_visibility === 'public';
    }
}
