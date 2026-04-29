<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'code',
        'logo_url',
        'founded_at',
        'country_id'
    ];

    protected $casts = [
        'founded_at' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }

    public function fixturesAsHomeTeam()
    {
        return $this->hasMany(Fixture::class, 'home_team_id');
    }

    public function fixturesAsAwayTeam()
    {
        return $this->hasMany(Fixture::class, 'away_team_id');
    }

    public function fixturePlayers()
    {
        return $this->hasMany(FixturePlayer::class);
    }

    public function fixtureEvents()
    {
        return $this->hasMany(FixtureEvent::class);
    }

    public function fixtureStats()
    {
        return $this->hasMany(FixtureStat::class);
    }

    public function lineups()
    {
        return $this->belongsToMany(Fixture::class, 'fixture_lineups')->withPivot('formation')->withTimestamps();
    }

    public function predictions()
    {
        return $this->hasMany(Prediction::class, 'winner_id');
    }
}
