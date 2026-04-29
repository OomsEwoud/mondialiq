<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'external_id',
        'country_id',
        'first_name',
        'last_name',
        'display_name',
        'birth_date',
        'photo_url',
        'position',
        'number'
    ];

    protected $casts = [
        'birth_date' => 'datetime',
        'number' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function missingFixtures()
    {
        return $this->belongsToMany(Fixture::class, 'missing_players')->withTimestamps();
    }

    public function fixturePlayers()
    {
        return $this->hasMany(FixturePlayer::class);
    }

    public function fixtureEvents()
    {
        return $this->hasMany(FixtureEvent::class);
    }

    public function assistFixtureEvents()
    {
        return $this->hasMany(FixtureEvent::class, 'assist_id');
    }

    public function playerFixtureStats()
    {
        return $this->hasMany(PlayerFixtureStat::class);
    }
}
