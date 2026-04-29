<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fixture extends Model
{
    protected $fillable = [
        'external_id',
        'league_id',
        'home_team_id',
        'away_team_id',
        'venue_id',
        'referee_id',
        'round_name',
        'season',
        'match_date',
        'status_long',
        'elapsed_time',
        'halftime_home_goals',
        'halftime_away_goals',
        'fulltime_home_goals',
        'fulltime_away_goals',
        'extratime_home_goals',
        'extratime_away_goals',
        'penalty_home_goals',
        'penalty_away_goals',
        'result',
    ];

    protected $casts = [
        'season' => 'integer',
        'match_date' => 'datetime',
        'halftime_home_goals' => 'integer',
        'halftime_away_goals' => 'integer',
        'fulltime_home_goals' => 'integer',
        'fulltime_away_goals' => 'integer',
        'extratime_home_goals' => 'integer',
        'extratime_away_goals' => 'integer',
        'penalty_home_goals' => 'integer',
        'penalty_away_goals' => 'integer',
    ];

    public function league()
    {
        return $this->belongsTo(League::class);
    }

    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    public function referee()
    {
        return $this->belongsTo(Referee::class);
    }

    public function weatherLog()
    {
        return $this->hasOne(WeatherLog::class);
    }

    public function missingPlayers()
    {
        return $this->belongsToMany(Player::class, 'missing_players')->withTimestamps();
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
        return $this->belongsToMany(Team::class, 'fixture_lineups')->withPivot('formation')->withTimestamps();
    }

    public function playerFixtureStats()
    {
        return $this->hasMany(PlayerFixtureStat::class);
    }
    public function predictions()
    {
        return $this->hasMany(Prediction::class);
    }

    public function fixtureOdds()
    {
        return $this->hasMany(FixtureOdd::class);
    }
}
