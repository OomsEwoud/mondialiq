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
    private const UPCOMING_DATA_SYNC_WINDOW_MINUTES = 15;
    private const PRE_MATCH_LINEUP_WINDOW_MINUTES = 90;
    private const POST_KICKOFF_LINEUP_WINDOW_MINUTES = 15;
    private const LINEUP_RETRY_MINUTES = 15;
    private const MAX_LINEUP_SYNC_ATTEMPTS = 12;
    private const BASIC_DATA_RETRY_MINUTES = 60;
    private const RECENT_FINAL_SYNC_WINDOW_HOURS = 6;
    private const MAX_FINAL_DATA_SYNC_ATTEMPTS = 3;
    private const MAX_PLAYER_STATS_SYNC_ATTEMPTS = 3;

    public const NOT_STARTED_STATUS_SHORT = 'NS';
    public const LIVE_STATUS_SHORTS = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'];
    public const FINISHED_STATUS_SHORTS = ['FT', 'AET', 'PEN'];

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
        'fixture_basics_synced_at',
        'has_lineups',
        'lineups_synced_at',
        'lineup_sync_attempts',
        'final_data_synced_at',
        'final_data_sync_attempts',
        'player_stats_synced_at',
        'player_stats_sync_attempts',
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

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->whereIn('status_short', self::LIVE_STATUS_SHORTS);
    }

    public function scopeNotStarted(Builder $query): Builder
    {
        return $query->where('status_short', self::NOT_STARTED_STATUS_SHORT);
    }

    public function scopeFinished(Builder $query): Builder
    {
        return $query->whereIn('status_short', self::FINISHED_STATUS_SHORTS);
    }

    public function scopeRelevantForDataSync(Builder $query): Builder
    {
        $now = now('UTC');
        $windowStart = $now->copy()->subHours(self::RECENT_DATA_SYNC_WINDOW_HOURS);
        $windowEnd = $now->copy()->addMinutes(self::UPCOMING_DATA_SYNC_WINDOW_MINUTES);

        return $query->where(function (Builder $query) use ($now, $windowStart, $windowEnd) {
            $query
                ->where(fn (Builder $query) => $query
                    ->whereBetween('match_date', [$windowStart, $windowEnd])
                    ->where(fn (Builder $query) => $query
                        ->whereNull('fixture_basics_synced_at')
                        ->orWhere('fixture_basics_synced_at', '<=', $now->copy()->subMinutes(self::BASIC_DATA_RETRY_MINUTES))))
                ->orWhere(fn (Builder $query) => $query->inProgress());
        });
    }

    public function scopeReadyForLineupSync(Builder $query): Builder
    {
        $now = now('UTC');

        return $query
            ->notStarted()
            ->whereBetween('match_date', [
                $now->copy()->subMinutes(self::POST_KICKOFF_LINEUP_WINDOW_MINUTES),
                $now->copy()->addMinutes(self::PRE_MATCH_LINEUP_WINDOW_MINUTES),
            ])
            ->where('has_lineups', false)
            ->where('lineup_sync_attempts', '<', self::MAX_LINEUP_SYNC_ATTEMPTS)
            ->where(fn (Builder $query) => $query
                ->whereNull('lineups_synced_at')
                ->orWhere('lineups_synced_at', '<=', $now->copy()->subMinutes(self::LINEUP_RETRY_MINUTES)));
    }

    public function scopeReadyForFinalDataSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where('match_date', '>=', now('UTC')->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS))
            ->where('final_data_sync_attempts', '<', self::MAX_FINAL_DATA_SYNC_ATTEMPTS)
            ->whereNull('final_data_synced_at');
    }

    public function scopeReadyForPlayerStatsSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where('match_date', '>=', now('UTC')->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS))
            ->where('player_stats_sync_attempts', '<', self::MAX_PLAYER_STATS_SYNC_ATTEMPTS)
            ->whereNull('player_stats_synced_at');
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
