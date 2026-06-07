<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
    private const UPCOMING_DATA_SYNC_WINDOW_MINUTES = 15;
    private const LINEUP_SYNC_BEFORE_KICKOFF_MINUTES = 45;
    private const LINEUP_SYNC_AFTER_KICKOFF_MINUTES = 30;
    private const LINEUP_RETRY_MINUTES = 15;
    private const BASIC_DATA_RETRY_MINUTES = 60;
    private const RECENT_FINAL_SYNC_WINDOW_HOURS = 6;
    private const MAX_FINAL_DATA_SYNC_ATTEMPTS = 3;
    private const MAX_PLAYER_STATS_SYNC_ATTEMPTS = 3;
    private const MATCH_TIMEZONE = 'Europe/Brussels';

    public const NOT_STARTED_STATUS_SHORT = 'NS';
    public const LIVE_STATUS_SHORTS = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'];
    public const FINISHED_STATUS_SHORTS = ['FT', 'AET', 'PEN'];
    public const UNAVAILABLE_UPCOMING_STATUS_SHORTS = [
        '1H',
        'HT',
        '2H',
        'ET',
        'BT',
        'P',
        'LIVE',
        'FT',
        'AET',
        'PEN',
        'CANC',
        'PST',
        'ABD',
        'AWD',
        'WO',
        'SUSP',
        'INT',
    ];
    private const UNAVAILABLE_UPCOMING_STATUS_LONG_PATTERNS = [
        '%Abandon%',
        '%Award%',
        '%Cancel%',
        '%Finished%',
        '%Forfeit%',
        '%Interrupt%',
        '%Postpon%',
        '%Suspend%',
        '%Walk%',
    ];
    private const UNAVAILABLE_LINEUP_STATUS_SHORTS = [
        'CANC',
        'PST',
        'ABD',
        'AWD',
        'WO',
        'SUSP',
        'INT',
    ];

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
        return $query->where(fn (Builder $query) => $query
            ->whereIn('status_short', self::LIVE_STATUS_SHORTS)
            ->orWhereIn('status_long', [
                'First Half',
                'Halftime',
                'Half Time',
                'Second Half',
                'Extra Time',
                'Break Time',
                'Penalty In Progress',
                'Live',
            ]));
    }

    public function scopeNotStarted(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->where('status_short', self::NOT_STARTED_STATUS_SHORT)
            ->orWhere(fn (Builder $query) => $query
                ->whereNull('status_short')
                ->where('status_long', 'Not Started')));
    }

    public function scopeUpcomingNotStarted(Builder $query): Builder
    {
        $now = now('UTC');

        foreach (self::UNAVAILABLE_UPCOMING_STATUS_LONG_PATTERNS as $statusPattern) {
            $query->where('status_long', 'not like', $statusPattern);
        }

        return $query
            ->where('match_date', '>', $now->format('Y-m-d H:i:s'))
            ->where(fn (Builder $query) => $query
                ->where('status_short', self::NOT_STARTED_STATUS_SHORT)
                ->orWhere(fn (Builder $query) => $query
                    ->whereNull('status_short')
                    ->where('status_long', 'Not Started')))
            ->where(fn (Builder $query) => $query
                ->whereNull('status_short')
                ->orWhereNotIn('status_short', self::UNAVAILABLE_UPCOMING_STATUS_SHORTS));
    }

    public function scopeFinished(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->whereIn('status_short', self::FINISHED_STATUS_SHORTS)
            ->orWhere('status_long', 'like', '%Finished%'));
    }

    public function scopeRelevantForDataSync(Builder $query): Builder
    {
        $now = now('UTC');
        $windowEnd = $now->copy()->addMinutes(self::UPCOMING_DATA_SYNC_WINDOW_MINUTES);
        $basicDataRetryCutoff = now('UTC')->subMinutes(self::BASIC_DATA_RETRY_MINUTES);

        return $query->where(function (Builder $query) use ($basicDataRetryCutoff, $now, $windowEnd) {
            $query
                ->where(fn (Builder $query) => $query->inProgress())
                ->orWhere(fn (Builder $query) => $query
                    ->notStarted()
                    ->where('match_date', '>', $now->format('Y-m-d H:i:s'))
                    ->whereBetween('match_date', [
                        $now->format('Y-m-d H:i:s'),
                        $windowEnd->format('Y-m-d H:i:s'),
                    ])
                    ->where(fn (Builder $query) => $query
                        ->whereNull('fixture_basics_synced_at')
                        ->orWhere('fixture_basics_synced_at', '<=', $basicDataRetryCutoff)))
                ->orWhere(fn (Builder $query) => $query->readyForFinalDataSync());
        });
    }

    public function scopeRelevantForFixtureDataSync(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->relevantForDataSync()
            ->orWhere(fn (Builder $query) => $query->lineupSyncWindow()));
    }

    public function scopeReadyForLineupSync(Builder $query): Builder
    {
        return $query
            ->lineupSyncWindow()
            ->where('has_lineups', false)
            ->where(fn (Builder $query) => $query
                ->whereNull('lineups_synced_at')
                ->orWhere('lineups_synced_at', '<=', $this->lineupRetryCutoff()));
    }

    public function scopeRelevantForLineupSync(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->relevantForDataSync()
            ->orWhere(fn (Builder $query) => $query->lineupSyncWindow()));
    }

    public function scopeLineupSyncWindow(Builder $query): Builder
    {
        [$windowStart, $windowEnd] = self::lineupSyncWindowBounds();

        return $query
            ->where(fn (Builder $query) => $query
                ->whereNull('status_short')
                ->orWhereNotIn('status_short', self::UNAVAILABLE_LINEUP_STATUS_SHORTS))
            ->whereBetween('match_date', [
                $windowStart->format('Y-m-d H:i:s'),
                $windowEnd->format('Y-m-d H:i:s'),
            ]);
    }

    public function shouldSyncLineups(bool $force = false): bool
    {
        if ($this->has_lineups) {
            return false;
        }

        if ($force) {
            return ! $this->isKnownUnavailableForLineups();
        }

        if ($this->isLivePastLineupWindow()) {
            return false;
        }

        if (! $force && $this->lineups_synced_at !== null && $this->lineups_synced_at->isAfter($this->lineupRetryCutoff())) {
            return false;
        }

        $matchDate = $this->lineupMatchDate();

        if (! $matchDate) {
            return false;
        }

        if ($this->isLive()) {
            return $this->isLiveWithinLineupWindow($matchDate);
        }

        if ($this->isFinished()) {
            return ! $this->has_lineups
                && $matchDate->betweenIncluded(
                    self::lineupSyncWindowStart(),
                    now(self::MATCH_TIMEZONE),
                );
        }

        if ($this->isKnownUnavailableForLineups()) {
            return false;
        }

        if ($matchDate->isFuture()) {
            return $matchDate->betweenIncluded(
                now(self::MATCH_TIMEZONE),
                self::lineupSyncWindowEnd(),
            );
        }

        return false;
    }

    public function lineupSyncSkipReason(bool $force = false): string
    {
        if ($this->has_lineups) {
            return 'lineups already synced';
        }

        if ($this->isLivePastLineupWindow()) {
            return 'live fixture is beyond the lineup sync window';
        }

        if (! $force && $this->lineups_synced_at !== null && $this->lineups_synced_at->isAfter($this->lineupRetryCutoff())) {
            return sprintf('lineups checked recently; retry after %d minutes', $this->lineupRetryMinutes());
        }

        if (! $this->match_date) {
            return 'missing match date';
        }

        if ($this->isKnownUnavailableForLineups()) {
            return 'fixture status cannot have lineups';
        }

        $matchDate = $this->lineupMatchDate();

        if ($matchDate?->isAfter(self::lineupSyncWindowEnd())) {
            return 'fixture starts too far in the future';
        }

        if ($this->isFinished()) {
            return 'finished fixture is outside the recent lineup retry window';
        }

        return 'fixture is outside the lineup sync window';
    }

    public function isLive(): bool
    {
        return in_array($this->status_short, self::LIVE_STATUS_SHORTS, true)
            || in_array($this->status_long, [
                'First Half',
                'Halftime',
                'Half Time',
                'Second Half',
                'Extra Time',
                'Break Time',
                'Penalty In Progress',
                'Live',
            ], true);
    }

    public function isNotStarted(): bool
    {
        return $this->status_short === self::NOT_STARTED_STATUS_SHORT
            || ($this->status_short === null && $this->status_long === 'Not Started');
    }

    public function isFinished(): bool
    {
        return in_array($this->status_short, self::FINISHED_STATUS_SHORTS, true)
            || str_contains($this->status_long ?? '', 'Finished');
    }

    private function isKnownUnavailableForLineups(): bool
    {
        return in_array($this->status_short, self::UNAVAILABLE_LINEUP_STATUS_SHORTS, true);
    }

    private function isLivePastLineupWindow(): bool
    {
        if (! $this->isLive()) {
            return false;
        }

        if (is_numeric($this->elapsed_time)) {
            return (int) $this->elapsed_time > self::LINEUP_SYNC_AFTER_KICKOFF_MINUTES;
        }

        $matchDate = $this->lineupMatchDate();

        if (! $matchDate) {
            return false;
        }

        return $matchDate->isBefore(self::lineupSyncWindowStart());
    }

    private function isLiveWithinLineupWindow(CarbonInterface $matchDate): bool
    {
        if (! $this->isLive() || $this->isLivePastLineupWindow()) {
            return false;
        }

        if (is_numeric($this->elapsed_time)) {
            return (int) $this->elapsed_time <= self::LINEUP_SYNC_AFTER_KICKOFF_MINUTES;
        }

        return $matchDate->betweenIncluded(
            self::lineupSyncWindowStart(),
            now(self::MATCH_TIMEZONE),
        );
    }

    private function lineupRetryMinutes(): int
    {
        $matchDate = $this->lineupMatchDate();

        if (! $matchDate) {
            return self::LINEUP_RETRY_MINUTES;
        }

        $kickoffInMinutes = now(self::MATCH_TIMEZONE)->diffInMinutes($matchDate, false);

        if ($kickoffInMinutes <= 30 && $kickoffInMinutes >= 0) {
            return 1;
        }

        if ($kickoffInMinutes <= 60 && $kickoffInMinutes > 30) {
            return 5;
        }

        return self::LINEUP_RETRY_MINUTES;
    }

    private static function lineupSyncWindowBounds(): array
    {
        return [
            self::lineupSyncWindowStart(),
            self::lineupSyncWindowEnd(),
        ];
    }

    private static function lineupNow(): CarbonImmutable
    {
        return now(self::MATCH_TIMEZONE)->toImmutable();
    }

    private static function lineupSyncWindowStart(): CarbonImmutable
    {
        return self::lineupNow()->subMinutes(self::LINEUP_SYNC_AFTER_KICKOFF_MINUTES);
    }

    private static function lineupSyncWindowEnd(): CarbonImmutable
    {
        return self::lineupNow()->addMinutes(self::LINEUP_SYNC_BEFORE_KICKOFF_MINUTES);
    }

    private function lineupRetryCutoff(): CarbonImmutable
    {
        return self::lineupNow()->subMinutes($this->lineupRetryMinutes());
    }

    private function lineupMatchDate(): ?CarbonImmutable
    {
        if (! $this->match_date) {
            return null;
        }

        $matchDate = CarbonImmutable::createFromFormat(
            'Y-m-d H:i:s',
            $this->match_date->format('Y-m-d H:i:s'),
            self::MATCH_TIMEZONE,
        );

        return $matchDate instanceof CarbonImmutable ? $matchDate : null;
    }

    public function scopeReadyForFinalDataSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where('match_date', '>=', now('UTC')->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS)->format('Y-m-d H:i:s'))
            ->where('final_data_sync_attempts', '<', self::MAX_FINAL_DATA_SYNC_ATTEMPTS)
            ->whereNull('final_data_synced_at');
    }

    public function scopeReadyForPlayerStatsSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where('match_date', '>=', now('UTC')->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS)->format('Y-m-d H:i:s'))
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
