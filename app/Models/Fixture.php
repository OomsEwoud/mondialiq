<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use App\Models\Concerns\HasFixtureStatus;
use App\Models\Concerns\HasFixtureSync;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'external_id',
    'league_id',
    'home_team_id',
    'away_team_id',
    'venue_id',
    'referee_id',
    'round_name',
    'season',
    'match_date',
    'status_short',
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
    'fixture_basics_synced_at',
    'has_lineups',
    'lineups_synced_at',
    'lineup_sync_attempts',
    'final_data_synced_at',
    'final_data_sync_attempts',
    'player_stats_synced_at',
    'player_stats_sync_attempts',
])]
class Fixture extends Model
{
    use HasFixtureStatus;
    use HasFixtureSync;

    protected function casts(): array
    {
        return [
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
            'fixture_basics_synced_at' => 'datetime',
            'has_lineups' => 'boolean',
            'lineups_synced_at' => 'datetime',
            'lineup_sync_attempts' => 'integer',
            'final_data_synced_at' => 'datetime',
            'final_data_sync_attempts' => 'integer',
            'player_stats_synced_at' => 'datetime',
            'player_stats_sync_attempts' => 'integer',
        ];
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function homeTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(Referee::class);
    }

    public function weatherLog(): HasOne
    {
        return $this->hasOne(WeatherLog::class);
    }

    public function missingPlayers(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'missing_players')
            ->withPivot(['type', 'reason'])
            ->withTimestamps();
    }

    public function missingPlayerRecords(): HasMany
    {
        return $this->hasMany(MissingPlayer::class);
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
        return $this->belongsToMany(Team::class, 'fixture_lineups')
            ->withPivot('formation')
            ->withTimestamps();
    }

    public function playerFixtureStats(): HasMany
    {
        return $this->hasMany(PlayerFixtureStat::class);
    }

    public function predictions(): HasMany
    {
        return $this->hasMany(Prediction::class);
    }

    public function userPredictions(): HasMany
    {
        return $this->hasMany(Prediction::class)
            ->where('source', PredictionTypes::User->value);
    }

    public function userPrediction(): HasOne
    {
        return $this->hasOne(Prediction::class)
            ->where('source', PredictionTypes::User->value);
    }

    public function apiPrediction(): HasOne
    {
        return $this->hasOne(Prediction::class)
            ->whereNull('user_id')
            ->where('source', PredictionTypes::Api->value);
    }

    public function aiPrediction(): HasOne
    {
        return $this->hasOne(Prediction::class)
            ->whereNull('user_id')
            ->where('source', PredictionTypes::Ai->value);
    }

    public function fixtureOdds(): HasMany
    {
        return $this->hasMany(FixtureOdd::class);
    }

    public function aiPredictions(): HasOne
    {
        return $this->aiPrediction();
    }

    public function kickoffAt(): string
    {
        $kickoffAt = CarbonImmutable::createFromFormat(
            'Y-m-d H:i:s',
            $this->match_date->format('Y-m-d H:i:s'),
            self::MATCH_TIMEZONE,
        );

        if (! $kickoffAt instanceof CarbonImmutable) {
            return $this->match_date->toIso8601String();
        }

        return $kickoffAt->toIso8601String();
    }
}
