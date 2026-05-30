<?php

namespace App\Queries\Fixture;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;

class FixtureQuery
{
    private const STATUS_ALL = 'all';
    private const STATUS_PLAYED = 'played';
    private const STATUS_UPCOMING = 'upcoming';

    private const FINISHED_STATUS_PATTERN = '%Finished%';
    private const UNAVAILABLE_UPCOMING_STATUS_PATTERNS = [
        '%Finished%',
        '%Postpon%',
        '%Cancel%',
        '%Abandon%',
        '%Forfeit%',
    ];

    public function __construct(
        private readonly int $leagueId,
        private readonly int $season,
    ) {
    }

    public function build(array $filters = []): Builder
    {
        return Fixture::query()
            ->where('league_id', $this->leagueId)
            ->where('season', $this->season)
            ->with(['homeTeam', 'awayTeam', 'apiPrediction'])
            ->when($filters['round'] ?? null, $this->applyRoundFilter(...))
            ->when($filters['date'] ?? null, $this->applyDateFilter(...))
            ->when($filters['team'] ?? null, $this->applyTeamFilter(...))
            ->when(
                ($filters['status'] ?? self::STATUS_ALL) !== self::STATUS_ALL,
                fn (Builder $query) => $this->applyStatusFilter($query, $filters['status']),
            )
            ->orderBy('match_date');
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
        return $query->where(function (Builder $query) use ($team) {
            $query
                ->whereHas('homeTeam', fn (Builder $query) => $this->applyTeamNameFilter($query, $team))
                ->orWhereHas('awayTeam', fn (Builder $query) => $this->applyTeamNameFilter($query, $team));
        });
    }

    private function applyTeamNameFilter(Builder $query, string $team): Builder
    {
        return $query->where('name', 'like', "%{$team}%");
    }

    private function applyStatusFilter(Builder $query, string $status): Builder
    {
        return match ($status) {
            self::STATUS_PLAYED => $this->applyPlayedStatusFilter($query),
            self::STATUS_UPCOMING => $this->applyUpcomingStatusFilter($query),
            default => $query,
        };
    }

    private function applyPlayedStatusFilter(Builder $query): Builder
    {
        return $query->where('status_long', 'like', self::FINISHED_STATUS_PATTERN);
    }

    private function applyUpcomingStatusFilter(Builder $query): Builder
    {
        foreach (self::UNAVAILABLE_UPCOMING_STATUS_PATTERNS as $statusPattern) {
            $query->where('status_long', 'not like', $statusPattern);
        }

        return $query;
    }
}
