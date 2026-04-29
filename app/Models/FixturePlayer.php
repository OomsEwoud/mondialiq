<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixturePlayer extends Model
{
     protected $fillable = [
        'fixture_id',
        'team_id',
        'player_id',
        'is_starting',
        'jersey_number',
        'position'
    ];

    protected $casts = [
        'is_starting' => 'boolean',
        'jersey_number' => 'integer',
    ];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
