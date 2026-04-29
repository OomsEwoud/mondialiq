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
}
