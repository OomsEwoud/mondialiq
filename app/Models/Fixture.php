<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Fixture extends Model
{
    private const RECENT_DATA_SYNC_WINDOW_HOURS = 3;
    private const UPCOMING_DATA_SYNC_WINDOW_HOURS = 3;

    private const LIVE_STATUS_SHORTS = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'];

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
    ];

    /**
     * @return array<string, string>
     */
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
        ];
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->whereIn('status_short', self::LIVE_STATUS_SHORTS);
    }

    public function scopeRelevantForDataSync(Builder $query): Builder
    {
        $now = now('UTC');
        $windowStart = $now->copy()->subHours(self::RECENT_DATA_SYNC_WINDOW_HOURS);
        $windowEnd = $now->copy()->addHours(self::UPCOMING_DATA_SYNC_WINDOW_HOURS);

        return $query->where(function (Builder $query) use ($windowStart, $windowEnd) {
            $query
                ->whereBetween('match_date', [
                    $windowStart,
                    $windowEnd,
                ])
                ->orWhere(fn (Builder $query) => $query->inProgress());
        });
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
}
