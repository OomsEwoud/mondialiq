<?php

namespace App\Queries\Fixture;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;

class FixtureQuery
{
    private const STATUS_ALL = 'all';
    private const STATUS_LIVE = 'live';
    private const STATUS_PLAYED = 'played';
    private const STATUS_UPCOMING = 'upcoming';
    private const DISPLAY_TIMEZONE = 'Europe/Brussels';

    private const FINISHED_STATUS_PATTERN = '%Finished%';
    private const LIVE_STATUS_SHORTS = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'];
    private const LIVE_STATUS_LONG_PATTERNS = [
        '%First Half%',
        '%Halftime%',
        '%Second Half%',
        '%Extra Time%',
        '%Break Time%',
        '%Penalty%',
        '%In Progress%',
        '%Suspended%',
        '%Interrupted%',
    ];

    public function __construct(
        private readonly int $leagueId,
        private readonly int $season,
    ) {}

    public function build(array $filters = []): Builder
    {
        $status = $this->statusFilter($filters);

        $query = Fixture::query()
            ->where('league_id', $this->leagueId)
            ->where('season', $this->season)
            ->with(['homeTeam', 'awayTeam', 'apiPrediction']);

        $query
            ->when($filters['round'] ?? null, $this->applyRoundFilter(...))
            ->when($filters['date'] ?? null, $this->applyDateFilter(...))
            ->when($filters['team'] ?? null, $this->applyTeamFilter(...))
            ->when(
                $status !== self::STATUS_ALL,
                fn(Builder $query) => $this->applyStatusFilter($query, $status),
            )
            ->orderBy('match_date');

        return $query;
    }
    private function statusFilter(array $filters): string
    {
        $status = $filters['status'] ?? self::STATUS_ALL;
        $normalizedStatus = is_string($status) ? $status : self::STATUS_ALL;

        return match ($normalizedStatus) {
            'past', 'finished' => self::STATUS_PLAYED,
            self::STATUS_LIVE, self::STATUS_PLAYED, self::STATUS_UPCOMING => $normalizedStatus,
            default => self::STATUS_ALL,
        };
    }

    private function applyRoundFilter(Builder $query, string $round): Builder
    {
        return $query->where('round_name', $round);
    }

    private function applyDateFilter(Builder $query, string $date): Builder
    {
        return $query->whereDate('match_date', $date);
    }

    private function applyTeamFilter(Builder $query, string $team): Builder
    {
        return $query->where(function ($query) use ($team) {
            $query
                ->whereHas('homeTeam', fn(Builder $query) => $this->applyTeamNameFilter($query, $team))
                ->orWhereHas('awayTeam', fn(Builder $query) => $this->applyTeamNameFilter($query, $team));
        });
    }

    private function applyTeamNameFilter(Builder $query, string $team): Builder
    {
        return $query->where('name', 'like', "%{$team}%");
    }

    private function applyStatusFilter(Builder $query, string $status): Builder
    {
        return match ($status) {
            self::STATUS_LIVE => $this->applyLiveStatusFilter($query),
            self::STATUS_PLAYED => $this->applyPlayedStatusFilter($query),
            self::STATUS_UPCOMING => $this->applyUpcomingStatusFilter($query),
            default => $query,
        };
    }

    private function applyLiveStatusFilter(Builder $query): Builder
    {
        return $query->where(fn($query) => $query
            ->whereIn('status_short', self::LIVE_STATUS_SHORTS)
            ->orWhere(fn($query) => $this->applyStatusLongPatterns($query, self::LIVE_STATUS_LONG_PATTERNS)));
    }

    private function applyPlayedStatusFilter(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->finished()
            ->orWhere('status_long', 'like', self::FINISHED_STATUS_PATTERN)
            ->orWhere(fn (Builder $query) => $query
                ->whereNull('status_short')
                ->whereNull('status_long')
                ->where('match_date', '<', now(self::DISPLAY_TIMEZONE)->format('Y-m-d H:i:s'))));
    }

    private function applyUpcomingStatusFilter(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->upcomingNotStarted()
            ->orWhere(fn (Builder $query) => $query
                ->where('status_short', Fixture::NOT_STARTED_STATUS_SHORT)
                ->whereNull('status_long')
                ->where('match_date', '>', now(self::DISPLAY_TIMEZONE)->format('Y-m-d H:i:s')))
            ->orWhere(fn (Builder $query) => $query
                ->whereNull('status_short')
                ->whereNull('status_long')
                ->where('match_date', '>', now(self::DISPLAY_TIMEZONE)->format('Y-m-d H:i:s'))));
    }

    private function applyStatusLongPatterns(Builder $query, array $patterns): Builder
    {
        foreach ($patterns as $pattern) {
            $query->orWhere('status_long', 'like', $pattern);
        }

        return $query;
    }
}
