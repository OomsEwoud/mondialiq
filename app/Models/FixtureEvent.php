<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureEvent extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_id',
        'player_id',
        'assist_id',
        'time_elapsed',
        'extra_time',
        'type',
        'detail',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'time_elapsed' => 'integer',
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

    public function assist(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'assist_id');
    }
}
