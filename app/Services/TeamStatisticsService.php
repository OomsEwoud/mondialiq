<?php

namespace App\Services;

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Apis\FootballApiService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class TeamStatisticsService
{
    private const REFRESH_HOURS_WITH_FIXTURE_TODAY = 24;
    private const REFRESH_DAYS_WITHOUT_FIXTURE_TODAY = 7;

    public function __construct(
        private readonly FootballApiService $api,
    ) {
    }

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

    /**
     * @return array{statistics_key: string}
     */
    private function teamStatisticIdentity(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return [
            'statistics_key' => $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $date),
        ];
    }

    private function fetchTeamStatistics(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return $this->api->getTeamStatistics($apiTeamId, $apiLeagueId, $season, $date);
    }

    /**
     * @return array<string, mixed>
     */
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
            ...$this->parseStatistics($response, $apiTeamId, $apiLeagueId, $season, $date),
            'fetched_at' => now(),
        ];
    }

    public function shouldRefresh(?TeamStatistic $existing, bool $hasFixtureToday, bool $force = false): bool
    {
        if ($force || ! $existing || ! $existing->fetched_at) {
            return true;
        }

        return $existing->fetched_at->lt($this->refreshThreshold($hasFixtureToday));
    }

    private function refreshThreshold(bool $hasFixtureToday): Carbon
    {
        return $hasFixtureToday
            ? now()->subHours(self::REFRESH_HOURS_WITH_FIXTURE_TODAY)
            : now()->subDays(self::REFRESH_DAYS_WITHOUT_FIXTURE_TODAY);
    }

    /**
     * @return array<string, array|float|int|string|null>
     */
    public function parseStatistics(
        array $response,
        int $apiTeamId,
        int $apiLeagueId,
        int $season,
        ?string $date = null,
    ): array {
        return [
            ...$this->baseStatisticAttributes($apiTeamId, $apiLeagueId, $season, $date),
            'form' => $this->nullableString(data_get($response, 'form')),
            ...$this->matchResultAttributes($response),
            ...$this->scoringAttributes($response),
            ...$this->availabilityAttributes($response),
            ...$this->streakAttributes($response),
            ...$this->contextAttributes($response),
            'raw_data' => $response,
        ];
    }

    /**
     * @return array{api_team_id: int, api_league_id: int, season: int, statistics_date: string|null, statistics_key: string}
     */
    private function baseStatisticAttributes(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return [
            'api_team_id' => $apiTeamId,
            'api_league_id' => $apiLeagueId,
            'season' => $season,
            'statistics_date' => $date,
            'statistics_key' => $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $date),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function matchResultAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'fixtures_played', 'fixtures.played'),
            ...$this->splitIntAttributes($response, 'wins', 'fixtures.wins'),
            ...$this->splitIntAttributes($response, 'draws', 'fixtures.draws'),
            ...$this->splitIntAttributes($response, 'losses', 'fixtures.loses'),
        ];
    }

    /**
     * @return array<string, float|int|null>
     */
    private function scoringAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'goals_for', 'goals.for.total'),
            ...$this->splitNullableFloatAttributes($response, 'goals_for_avg', 'goals.for.average'),
            ...$this->splitIntAttributes($response, 'goals_against', 'goals.against.total'),
            ...$this->splitNullableFloatAttributes($response, 'goals_against_avg', 'goals.against.average'),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function availabilityAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'clean_sheets', 'clean_sheet'),
            ...$this->splitIntAttributes($response, 'failed_to_score', 'failed_to_score'),
        ];
    }

    /**
     * @return array{biggest_wins_streak: int, biggest_draws_streak: int, biggest_losses_streak: int}
     */
    private function streakAttributes(array $response): array
    {
        return [
            'biggest_wins_streak' => $this->toInt(data_get($response, 'biggest.streak.wins')),
            'biggest_draws_streak' => $this->toInt(data_get($response, 'biggest.streak.draws')),
            'biggest_losses_streak' => $this->toInt(data_get($response, 'biggest.streak.loses')),
        ];
    }

    /**
     * @return array{most_used_formation: string|null, lineups: array<mixed>|null, cards: array<mixed>|null, goals_by_minute: array{for: array<mixed>|null, against: array<mixed>|null}}
     */
    private function contextAttributes(array $response): array
    {
        return [
            'most_used_formation' => $this->getMostUsedFormation(data_get($response, 'lineups', [])),
            'lineups' => $this->normalizeArray(data_get($response, 'lineups')),
            'cards' => $this->normalizeArray(data_get($response, 'cards')),
            'goals_by_minute' => [
                'for' => $this->normalizeArray(data_get($response, 'goals.for.minute')),
                'against' => $this->normalizeArray(data_get($response, 'goals.against.minute')),
            ],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function splitIntAttributes(array $response, string $prefix, string $path): array
    {
        return [
            "{$prefix}_home" => $this->toInt(data_get($response, "{$path}.home")),
            "{$prefix}_away" => $this->toInt(data_get($response, "{$path}.away")),
            "{$prefix}_total" => $this->toInt(data_get($response, "{$path}.total")),
        ];
    }

    /**
     * @return array<string, float|null>
     */
    private function splitNullableFloatAttributes(array $response, string $prefix, string $path): array
    {
        return [
            "{$prefix}_home" => $this->toNullableFloat(data_get($response, "{$path}.home")),
            "{$prefix}_away" => $this->toNullableFloat(data_get($response, "{$path}.away")),
            "{$prefix}_total" => $this->toNullableFloat(data_get($response, "{$path}.total")),
        ];
    }

    public function getMostUsedFormation(array $lineups): ?string
    {
        if ($lineups === []) {
            return null;
        }

        $formation = collect($lineups)
            ->filter(fn (mixed $lineup): bool => is_array($lineup) && isset($lineup['formation']))
            ->sortByDesc(fn (array $lineup): int => $this->toInt($lineup['played'] ?? 0))
            ->pluck('formation')
            ->first();

        return is_string($formation) && $formation !== '' ? $formation : null;
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

    public function makeStatisticsKey(int $apiTeamId, int $apiLeagueId, int $season, ?string $date = null): string
    {
        $suffix = $date ?? 'season';

        return "{$apiTeamId}-{$apiLeagueId}-{$season}-{$suffix}";
    }

    private function toInt(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    private function toNullableFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    /**
     * @return array<mixed>|null
     */
    private function normalizeArray(mixed $value): ?array
    {
        return is_array($value) ? $value : null;
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }

    private function normalizeDate(?string $date): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        return CarbonImmutable::parse($date)->toDateString();
    }
}
