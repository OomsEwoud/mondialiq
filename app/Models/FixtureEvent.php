<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixtureEvent extends Model
{
    protected $fillable = [
        'fixture_id',
        'team_id',
        'player_id',
        'assist_id',
        'time_elapsed',
        'type',
        'detail'
    ];

    protected $casts = [
        'time_elapsed' => 'integer',
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

    public function assist()
    {
        return $this->belongsTo(Player::class, 'assist_id');
    }
}
