<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'external_id',
    'name',
    'code',
    'logo_url',
    'founded_at',
    'country_id',
])]
class Team extends Model
{
    protected function casts(): array
    {
        return [
            'founded_at' => 'integer',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function standings(): HasMany
    {
        return $this->hasMany(Standing::class);
    }

    public function coach(): HasOne
    {
        return $this->hasOne(Coach::class);
    }

    public function fixturesAsHomeTeam(): HasMany
    {
        return $this->hasMany(Fixture::class, 'home_team_id');
    }

    public function fixturesAsAwayTeam(): HasMany
    {
        return $this->hasMany(Fixture::class, 'away_team_id');
    }

    public function fixturePlayers(): HasMany
    {
        return $this->hasMany(FixturePlayer::class);
    }

    public function fixtureEvents(): HasMany
    {
        return $this->hasMany(FixtureEvent::class);
    }

    public function fixtureStats(): HasMany
    {
        return $this->hasMany(FixtureStat::class);
    }

    public function lineups(): BelongsToMany
    {
        return $this->belongsToMany(Fixture::class, 'fixture_lineups')
            ->withPivot('formation')
            ->withTimestamps();
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class, 'winner_id');
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'teams_has_players')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function headToHeadsAsTeamA(): HasMany
    {
        return $this->hasMany(HeadToHead::class, 'team_a_id');
    }

    public function headToHeadsAsTeamB(): HasMany
    {
        return $this->hasMany(HeadToHead::class, 'team_b_id');
    }

    public function teamStatistics(): HasMany
    {
        return $this->hasMany(TeamStatistic::class);
    }
}
