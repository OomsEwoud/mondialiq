<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Scoreboard extends Model
{
    protected $fillable = [
        'name',
        'description',
        'icon',
        'accent_color',
        'cover_style',
        'code',
        'owner_id',
        'reward_title',
        'reward_description',
        'visibility',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_has_scoreboards')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }
}
