<?php

namespace App\Services;

use App\Models\HeadToHead;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class HeadToHeadService
{
    public const REFRESH_AFTER_DAYS = 90;

    public function __construct(
        private readonly FootballApiService $api,
    ) {
    }

    public function makePairKey(int $teamAId, int $teamBId): string
    {
        [$normalizedTeamAId, $normalizedTeamBId] = $this->normalizeTeamIds($teamAId, $teamBId);

        return "{$normalizedTeamAId}-{$normalizedTeamBId}";
    }

    public function hasFreshData(int $homeTeamId, int $awayTeamId): bool
    {
        return HeadToHead::query()
            ->where('pair_key', $this->makePairKey($homeTeamId, $awayTeamId))
            ->where('fetched_at', '>=', now()->subDays(self::REFRESH_AFTER_DAYS))
            ->exists();
    }

    public function importForTeams(int $homeTeamId, int $awayTeamId, bool $force = false): HeadToHead
    {
        [$teamAId, $teamBId] = $this->normalizeTeamIds($homeTeamId, $awayTeamId);
        $pairKey = $this->makePairKey($homeTeamId, $awayTeamId);

        $existingHeadToHead = HeadToHead::query()->where('pair_key', $pairKey)->first();

        if (! $force && $existingHeadToHead?->fetched_at?->gte(now()->subDays(self::REFRESH_AFTER_DAYS))) {
            return $existingHeadToHead;
        }

        $teamAExternalId = Team::query()->whereKey($teamAId)->value('external_id');
        $teamBExternalId = Team::query()->whereKey($teamBId)->value('external_id');

        if (! is_numeric($teamAExternalId) || ! is_numeric($teamBExternalId)) {
            throw new InvalidArgumentException('Teams missen een geldige external_id voor head-to-head import.');
        }

        $response = $this->api->getHeadToHead((int) $teamAExternalId, (int) $teamBExternalId);
        $summary = $this->calculateSummary($response, $teamAId, $teamBId);

        return HeadToHead::query()->updateOrCreate(
            ['pair_key' => $pairKey],
            $this->headToHeadAttributes($summary, $teamAId, $teamBId),
        );
    }

    /**
     * @param  array{
     *     total_matches: int,
     *     team_a_wins: int,
     *     team_b_wins: int,
     *     draws: int,
     *     team_a_goals: int,
     *     team_b_goals: int,
     *     last_meeting_at: \Illuminate\Support\Carbon|null,
     *     raw_data: array
     * }  $summary
     * @return array<string, mixed>
     */
    private function headToHeadAttributes(array $summary, int $teamAId, int $teamBId): array
    {
        return [
            'team_a_id' => $teamAId,
            'team_b_id' => $teamBId,
            'total_matches' => $summary['total_matches'],
            'team_a_wins' => $summary['team_a_wins'],
            'team_b_wins' => $summary['team_b_wins'],
            'draws' => $summary['draws'],
            'team_a_goals' => $summary['team_a_goals'],
            'team_b_goals' => $summary['team_b_goals'],
            'last_meeting_at' => $summary['last_meeting_at'],
            'raw_data' => $summary['raw_data'],
            'fetched_at' => now(),
        ];
    }

    /**
     * @return array{
     *     total_matches: int,
     *     team_a_wins: int,
     *     team_b_wins: int,
     *     draws: int,
     *     team_a_goals: int,
     *     team_b_goals: int,
     *     last_meeting_at: \Illuminate\Support\Carbon|null,
     *     raw_data: array
     * }
     */
    public function calculateSummary(array $response, int $teamAId, int $teamBId): array
    {
        $teamIdsByExternalId = $this->teamIdsByExternalId($response);
        $summary = $this->emptySummary($response);
        $finishedMatchDates = [];

        foreach ($response as $fixtureData) {
            if (data_get($fixtureData, 'fixture.status.short') !== 'FT') {
                continue;
            }

            $homeTeamIdForMatch = $teamIdsByExternalId[(int) data_get($fixtureData, 'teams.home.id')] ?? null;
            $awayTeamIdForMatch = $teamIdsByExternalId[(int) data_get($fixtureData, 'teams.away.id')] ?? null;

            if (! is_int($homeTeamIdForMatch) || ! is_int($awayTeamIdForMatch)) {
                continue;
            }

            $homeGoals = $this->normalizeGoals(data_get($fixtureData, 'goals.home'));
            $awayGoals = $this->normalizeGoals(data_get($fixtureData, 'goals.away'));

            if ($homeGoals === null || $awayGoals === null) {
                continue;
            }

            $scoreForTeamA = $this->scoreForTeamA(
                $teamAId,
                $homeTeamIdForMatch,
                $awayTeamIdForMatch,
                $homeGoals,
                $awayGoals,
            );

            if ($scoreForTeamA === null) {
                continue;
            }

            [$teamAGoals, $teamBGoals] = $scoreForTeamA;
            $summary['total_matches']++;
            $summary['team_a_goals'] += $teamAGoals;
            $summary['team_b_goals'] += $teamBGoals;

            $summary = $this->recordResult($summary, $teamAGoals, $teamBGoals);

            $fixtureDate = data_get($fixtureData, 'fixture.date');

            if (is_string($fixtureDate) && $fixtureDate !== '') {
                $finishedMatchDates[] = CarbonImmutable::parse($fixtureDate);
            }
        }

        $summary['last_meeting_at'] = $this->lastMeetingAt($finishedMatchDates);

        return $summary;
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function teamIdsByExternalId(array $response): Collection
    {
        return Team::query()
            ->whereIn('external_id', $this->externalTeamIds($response))
            ->pluck('id', 'external_id');
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function externalTeamIds(array $response): Collection
    {
        return collect($response)
            ->flatMap(fn (array $fixtureData): array => [
                data_get($fixtureData, 'teams.home.id'),
                data_get($fixtureData, 'teams.away.id'),
            ])
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }

    /**
     * @return array{
     *     total_matches: int,
     *     team_a_wins: int,
     *     team_b_wins: int,
     *     draws: int,
     *     team_a_goals: int,
     *     team_b_goals: int,
     *     last_meeting_at: \Illuminate\Support\Carbon|null,
     *     raw_data: array
     * }
     */
    private function emptySummary(array $response): array
    {
        return [
            'total_matches' => 0,
            'team_a_wins' => 0,
            'team_b_wins' => 0,
            'draws' => 0,
            'team_a_goals' => 0,
            'team_b_goals' => 0,
            'last_meeting_at' => null,
            'raw_data' => $response,
        ];
    }

    /**
     * @return array{0: int, 1: int}|null
     */
    private function scoreForTeamA(
        int $teamAId,
        int $homeTeamId,
        int $awayTeamId,
        int $homeGoals,
        int $awayGoals,
    ): ?array {
        if ($homeTeamId === $teamAId) {
            return [$homeGoals, $awayGoals];
        }

        if ($awayTeamId === $teamAId) {
            return [$awayGoals, $homeGoals];
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $summary
     * @return array<string, mixed>
     */
    private function recordResult(array $summary, int $teamAGoals, int $teamBGoals): array
    {
        if ($teamAGoals === $teamBGoals) {
            $summary['draws']++;

            return $summary;
        }

        if ($teamAGoals > $teamBGoals) {
            $summary['team_a_wins']++;

            return $summary;
        }

        $summary['team_b_wins']++;

        return $summary;
    }

    /**
     * @param  array<int, \Carbon\CarbonImmutable>  $finishedMatchDates
     */
    private function lastMeetingAt(array $finishedMatchDates): ?Carbon
    {
        if ($finishedMatchDates === []) {
            return null;
        }

        return Carbon::instance(
            collect($finishedMatchDates)
                ->sortDesc()
                ->first()
                ->toMutable(),
        );
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function normalizeTeamIds(int $teamAId, int $teamBId): array
    {
        if ($teamAId === $teamBId) {
            throw new InvalidArgumentException('Head-to-head import vereist twee verschillende teams.');
        }

        return $teamAId < $teamBId
            ? [$teamAId, $teamBId]
            : [$teamBId, $teamAId];
    }

    private function normalizeGoals(mixed $goals): ?int
    {
        return is_numeric($goals) ? (int) $goals : null;
    }
}
