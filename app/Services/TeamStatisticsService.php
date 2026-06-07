<?php

namespace App\Services;

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Apis\FootballApiService;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

class TeamStatisticsService
{
    private const REFRESH_HOURS_WITH_FIXTURE_TODAY = 24;

    private const REFRESH_DAYS_WITHOUT_FIXTURE_TODAY = 7;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly TeamStatisticAttributesMapper $attributesMapper,
    ) {}

    public function importForTeam(
        int $apiTeamId,
        int $apiLeagueId,
        int $season,
        ?string $date = null,
        bool $force = false,
    ): TeamStatistic {
        $normalizedDate = $this->normalizeDate($date);
        $existing = $this->findExisting($apiTeamId, $apiLeagueId, $season, $normalizedDate);
        $hasFixtureToday = $this->teamHasFixtureToday($apiTeamId, $apiLeagueId, $season);

        if (! $this->shouldRefresh($existing, $hasFixtureToday, $force)) {
            return $existing;
        }

        return TeamStatistic::query()->updateOrCreate(
            $this->teamStatisticIdentity($apiTeamId, $apiLeagueId, $season, $normalizedDate),
            $this->teamStatisticAttributes(
                $this->fetchTeamStatistics($apiTeamId, $apiLeagueId, $season, $normalizedDate),
                $apiTeamId,
                $apiLeagueId,
                $season,
                $normalizedDate,
            ),
        );
    }

    public function shouldRefresh(?TeamStatistic $existing, bool $hasFixtureToday, bool $force = false): bool
    {
        if ($force || ! $existing || ! $existing->fetched_at) {
            return true;
        }

        return $existing->fetched_at->lt($this->refreshThreshold($hasFixtureToday));
    }

    public function findExisting(int $apiTeamId, int $apiLeagueId, int $season, ?string $date = null): ?TeamStatistic
    {
        $normalizedDate = $this->normalizeDate($date);

        return TeamStatistic::query()
            ->where('statistics_key', $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $normalizedDate))
            ->first();
    }

    public function teamHasFixtureToday(int $apiTeamId, int $apiLeagueId, int $season): bool
    {
        $teamId = $this->localTeamId($apiTeamId);
        $leagueId = $this->localLeagueId($apiLeagueId);

        if ($teamId === null || $leagueId === null) {
            return false;
        }

        return Fixture::query()
            ->where('league_id', $leagueId)
            ->where('season', $season)
            ->whereDate('match_date', today('UTC'))
            ->where(function (Builder $query) use ($teamId) {
                $query
                    ->where('home_team_id', $teamId)
                    ->orWhere('away_team_id', $teamId);
            })
            ->exists();
    }

    public function parseStatistics(
        array $response,
        int $apiTeamId,
        int $apiLeagueId,
        int $season,
        ?string $date = null,
    ): array {
        return $this->attributesMapper->parseStatistics($response, $apiTeamId, $apiLeagueId, $season, $date);
    }

    public function getMostUsedFormation(array $lineups): ?string
    {
        return $this->attributesMapper->getMostUsedFormation($lineups);
    }

    public function makeStatisticsKey(int $apiTeamId, int $apiLeagueId, int $season, ?string $date = null): string
    {
        $suffix = $date ?? 'season';

        return "{$apiTeamId}-{$apiLeagueId}-{$season}-{$suffix}";
    }

    private function fetchTeamStatistics(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return $this->api->getTeamStatistics($apiTeamId, $apiLeagueId, $season, $date);
    }

    private function teamStatisticIdentity(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return [
            'statistics_key' => $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $date),
        ];
    }

    private function teamStatisticAttributes(
        array $response,
        int $apiTeamId,
        int $apiLeagueId,
        int $season,
        ?string $date,
    ): array {
        return [
            'team_id' => $this->localTeamId($apiTeamId),
            'league_id' => $this->localLeagueId($apiLeagueId),
            ...$this->attributesMapper->parseStatistics($response, $apiTeamId, $apiLeagueId, $season, $date),
            'fetched_at' => now(),
        ];
    }

    private function refreshThreshold(bool $hasFixtureToday): CarbonInterface
    {
        return $hasFixtureToday
            ? now()->subHours(self::REFRESH_HOURS_WITH_FIXTURE_TODAY)
            : now()->subDays(self::REFRESH_DAYS_WITHOUT_FIXTURE_TODAY);
    }

    private function localTeamId(int $apiTeamId): ?int
    {
        return $this->localId(
            Team::query()->where('external_id', $apiTeamId)->value('id'),
        );
    }

    private function localLeagueId(int $apiLeagueId): ?int
    {
        return $this->localId(
            League::query()->where('external_id', $apiLeagueId)->value('id'),
        );
    }

    private function localId(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private function normalizeDate(?string $date): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        return CarbonImmutable::parse($date)->toDateString();
    }
}
