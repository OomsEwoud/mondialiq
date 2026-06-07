<?php

namespace App\Models\Concerns;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

trait HasFixtureSync
{
    private const UPCOMING_DATA_SYNC_WINDOW_MINUTES = 15;

    private const LINEUP_SYNC_BEFORE_KICKOFF_MINUTES = 45;

    private const LINEUP_SYNC_AFTER_KICKOFF_MINUTES = 15;

    private const LINEUP_RETRY_MINUTES = 15;

    private const BASIC_DATA_RETRY_MINUTES = 60;

    private const RECENT_FINAL_SYNC_WINDOW_HOURS = 6;

    private const MAX_FINAL_DATA_SYNC_ATTEMPTS = 3;

    private const MAX_PLAYER_STATS_SYNC_ATTEMPTS = 3;

    private const MATCH_TIMEZONE = 'Europe/Brussels';

    private const UNAVAILABLE_LINEUP_STATUS_SHORTS = [
        'CANC',
        'PST',
        'ABD',
        'AWD',
        'WO',
        'SUSP',
        'INT',
    ];

    public function scopeRelevantForDataSync(Builder $query): Builder
    {
        $now = now(self::MATCH_TIMEZONE);
        $windowEnd = $now->copy()->addMinutes(self::UPCOMING_DATA_SYNC_WINDOW_MINUTES);
        $basicDataRetryCutoff = now(self::MATCH_TIMEZONE)->subMinutes(self::BASIC_DATA_RETRY_MINUTES);

        return $query->where(function (Builder $query) use ($basicDataRetryCutoff, $now, $windowEnd) {
            $query
                ->where(fn (Builder $query) => $query->inProgress())
                ->orWhere(
                    fn (Builder $query) => $query
                        ->notStarted()
                        ->where('match_date', '>', $now->format('Y-m-d H:i:s'))
                        ->whereBetween('match_date', [
                            $now->format('Y-m-d H:i:s'),
                            $windowEnd->format('Y-m-d H:i:s'),
                        ])
                        ->where(
                            fn (Builder $query) => $query
                                ->whereNull('fixture_basics_synced_at')
                                ->orWhere('fixture_basics_synced_at', '<=', $basicDataRetryCutoff),
                        ),
                )
                ->orWhere(fn (Builder $query) => $query->readyForFinalDataSync());
        });
    }

    public function scopeRelevantForFixtureDataSync(Builder $query): Builder
    {
        return $query->relevantForDataSync();
    }

    public function scopeReadyForLineupSync(Builder $query): Builder
    {
        return $query
            ->lineupSyncWindow()
            ->where('has_lineups', false)
            ->where(
                fn (Builder $query) => $query
                    ->whereNull('lineups_synced_at')
                    ->orWhere('lineups_synced_at', '<=', $this->lineupRetryCutoff()),
            );
    }

    public function scopeRelevantForLineupSync(Builder $query): Builder
    {
        return $query->where(
            fn (Builder $query) => $query
                ->relevantForDataSync()
                ->orWhere(fn (Builder $query) => $query->lineupSyncWindow()),
        );
    }

    public function scopeLineupSyncWindow(Builder $query): Builder
    {
        [$windowStart, $windowEnd] = self::lineupSyncWindowBounds();

        return $query
            ->where(
                fn (Builder $query) => $query
                    ->whereNull('status_short')
                    ->orWhereNotIn('status_short', self::UNAVAILABLE_LINEUP_STATUS_SHORTS),
            )
            ->whereBetween('match_date', [
                $windowStart->format('Y-m-d H:i:s'),
                $windowEnd->format('Y-m-d H:i:s'),
            ]);
    }

    public function scopeReadyForFinalDataSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where(
                'match_date',
                '>=',
                now(self::MATCH_TIMEZONE)
                    ->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS)
                    ->format('Y-m-d H:i:s'),
            )
            ->where(
                fn (Builder $query) => $query
                    ->whereNull('final_data_sync_attempts')
                    ->orWhere('final_data_sync_attempts', '<', self::MAX_FINAL_DATA_SYNC_ATTEMPTS),
            )
            ->whereNull('final_data_synced_at');
    }

    public function scopeReadyForPlayerStatsSync(Builder $query): Builder
    {
        return $query
            ->finished()
            ->where(
                'match_date',
                '>=',
                now('UTC')
                    ->subHours(self::RECENT_FINAL_SYNC_WINDOW_HOURS)
                    ->format('Y-m-d H:i:s'),
            )
            ->where('player_stats_sync_attempts', '<', self::MAX_PLAYER_STATS_SYNC_ATTEMPTS)
            ->whereNull('player_stats_synced_at');
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
            return sprintf(
                'lineups checked recently; retry after %d minutes',
                $this->lineupRetryMinutes(),
            );
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

    private function isKnownUnavailableForLineups(): bool
    {
        return in_array(
            $this->status_short,
            self::UNAVAILABLE_LINEUP_STATUS_SHORTS,
            true,
        );
    }
}
