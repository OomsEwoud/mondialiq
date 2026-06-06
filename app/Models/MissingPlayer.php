<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'fixture_id',
    'player_id',
    'type',
    'reason',
])]
class MissingPlayer extends Model
{
    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
