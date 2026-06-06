<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'fixture_id',
    'team_id',
    'player_id',
    'is_starting',
    'jersey_number',
    'position',
])]
class FixturePlayer extends Model
{
    protected function casts(): array
    {
        return [
            'is_starting' => 'boolean',
            'jersey_number' => 'integer',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
