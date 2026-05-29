<?php

namespace App\Services;

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Apis\FootballApiService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class TeamStatisticsService
{
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

        $response = $this->api->getTeamStatistics($apiTeamId, $apiLeagueId, $season, $normalizedDate);
        $teamId = Team::query()->where('external_id', $apiTeamId)->value('id');
        $leagueId = League::query()->where('external_id', $apiLeagueId)->value('id');

        $attributes = [
            'team_id' => $teamId,
            'league_id' => $leagueId,
            ...$this->parseStatistics($response, $apiTeamId, $apiLeagueId, $season, $normalizedDate),
            'fetched_at' => now(),
        ];

        return TeamStatistic::query()->updateOrCreate(
            ['statistics_key' => $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $normalizedDate)],
            $attributes,
        );
    }

    public function shouldRefresh(?TeamStatistic $existing, bool $hasFixtureToday, bool $force = false): bool
    {
        if ($force || ! $existing || ! $existing->fetched_at) {
            return true;
        }

        $threshold = $hasFixtureToday
            ? now()->subDay()
            : now()->subDays(7);

        return $existing->fetched_at->lt($threshold);
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
            'api_team_id' => $apiTeamId,
            'api_league_id' => $apiLeagueId,
            'season' => $season,
            'statistics_date' => $date,
            'statistics_key' => $this->makeStatisticsKey($apiTeamId, $apiLeagueId, $season, $date),
            'form' => $this->nullableString(data_get($response, 'form')),
            'fixtures_played_home' => $this->toInt(data_get($response, 'fixtures.played.home')),
            'fixtures_played_away' => $this->toInt(data_get($response, 'fixtures.played.away')),
            'fixtures_played_total' => $this->toInt(data_get($response, 'fixtures.played.total')),
            'wins_home' => $this->toInt(data_get($response, 'fixtures.wins.home')),
            'wins_away' => $this->toInt(data_get($response, 'fixtures.wins.away')),
            'wins_total' => $this->toInt(data_get($response, 'fixtures.wins.total')),
            'draws_home' => $this->toInt(data_get($response, 'fixtures.draws.home')),
            'draws_away' => $this->toInt(data_get($response, 'fixtures.draws.away')),
            'draws_total' => $this->toInt(data_get($response, 'fixtures.draws.total')),
            'losses_home' => $this->toInt(data_get($response, 'fixtures.loses.home')),
            'losses_away' => $this->toInt(data_get($response, 'fixtures.loses.away')),
            'losses_total' => $this->toInt(data_get($response, 'fixtures.loses.total')),
            'goals_for_home' => $this->toInt(data_get($response, 'goals.for.total.home')),
            'goals_for_away' => $this->toInt(data_get($response, 'goals.for.total.away')),
            'goals_for_total' => $this->toInt(data_get($response, 'goals.for.total.total')),
            'goals_for_avg_home' => $this->toNullableFloat(data_get($response, 'goals.for.average.home')),
            'goals_for_avg_away' => $this->toNullableFloat(data_get($response, 'goals.for.average.away')),
            'goals_for_avg_total' => $this->toNullableFloat(data_get($response, 'goals.for.average.total')),
            'goals_against_home' => $this->toInt(data_get($response, 'goals.against.total.home')),
            'goals_against_away' => $this->toInt(data_get($response, 'goals.against.total.away')),
            'goals_against_total' => $this->toInt(data_get($response, 'goals.against.total.total')),
            'goals_against_avg_home' => $this->toNullableFloat(data_get($response, 'goals.against.average.home')),
            'goals_against_avg_away' => $this->toNullableFloat(data_get($response, 'goals.against.average.away')),
            'goals_against_avg_total' => $this->toNullableFloat(data_get($response, 'goals.against.average.total')),
            'clean_sheets_home' => $this->toInt(data_get($response, 'clean_sheet.home')),
            'clean_sheets_away' => $this->toInt(data_get($response, 'clean_sheet.away')),
            'clean_sheets_total' => $this->toInt(data_get($response, 'clean_sheet.total')),
            'failed_to_score_home' => $this->toInt(data_get($response, 'failed_to_score.home')),
            'failed_to_score_away' => $this->toInt(data_get($response, 'failed_to_score.away')),
            'failed_to_score_total' => $this->toInt(data_get($response, 'failed_to_score.total')),
            'biggest_wins_streak' => $this->toInt(data_get($response, 'biggest.streak.wins')),
            'biggest_draws_streak' => $this->toInt(data_get($response, 'biggest.streak.draws')),
            'biggest_losses_streak' => $this->toInt(data_get($response, 'biggest.streak.loses')),
            'most_used_formation' => $this->getMostUsedFormation(data_get($response, 'lineups', [])),
            'lineups' => $this->normalizeArray(data_get($response, 'lineups')),
            'cards' => $this->normalizeArray(data_get($response, 'cards')),
            'goals_by_minute' => [
                'for' => $this->normalizeArray(data_get($response, 'goals.for.minute')),
                'against' => $this->normalizeArray(data_get($response, 'goals.against.minute')),
            ],
            'raw_data' => $response,
        ];
    }

    public function getMostUsedFormation(array $lineups): ?string
    {
        if ($lineups === []) {
            return null;
        }

        return collect($lineups)
            ->filter(fn (mixed $lineup): bool => is_array($lineup) && isset($lineup['formation']))
            ->sortByDesc(fn (array $lineup): int => $this->toInt($lineup['played'] ?? 0))
            ->pluck('formation')
            ->first();
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
        $teamId = Team::query()->where('external_id', $apiTeamId)->value('id');
        $leagueId = League::query()->where('external_id', $apiLeagueId)->value('id');

        if (! is_int($teamId) || ! is_int($leagueId)) {
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
