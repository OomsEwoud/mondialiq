<?php

namespace App\Services;

use App\Models\HeadToHead;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class HeadToHeadService
{
    public function __construct(
        protected FootballApiService $api,
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
            ->where('fetched_at', '>=', now()->subDay())
            ->exists();
    }

    public function importForTeams(int $homeTeamId, int $awayTeamId, bool $force = false): HeadToHead
    {
        [$teamAId, $teamBId] = $this->normalizeTeamIds($homeTeamId, $awayTeamId);
        $pairKey = $this->makePairKey($homeTeamId, $awayTeamId);

        $existingHeadToHead = HeadToHead::query()->where('pair_key', $pairKey)->first();

        if (! $force && $existingHeadToHead?->fetched_at?->gte(now()->subDay())) {
            return $existingHeadToHead;
        }

        $teamAExternalId = Team::query()->whereKey($teamAId)->value('external_id');
        $teamBExternalId = Team::query()->whereKey($teamBId)->value('external_id');

        if (! is_int($teamAExternalId) || ! is_int($teamBExternalId)) {
            throw new InvalidArgumentException('Teams missen een geldige external_id voor head-to-head import.');
        }

        $response = $this->api->getHeadToHead($teamAExternalId, $teamBExternalId);
        $summary = $this->calculateSummary($response, $teamAId, $teamBId);

        return HeadToHead::query()->updateOrCreate(
            ['pair_key' => $pairKey],
            [
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
            ],
        );
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
        $teamIdsByExternalId = Team::query()
            ->whereIn('external_id', collect($response)
                ->flatMap(fn (array $fixtureData): array => [
                    data_get($fixtureData, 'teams.home.id'),
                    data_get($fixtureData, 'teams.away.id'),
                ])
                ->filter(fn (mixed $value): bool => is_numeric($value))
                ->map(fn (mixed $value): int => (int) $value)
                ->unique()
                ->values())
            ->pluck('id', 'external_id');

        $summary = [
            'total_matches' => 0,
            'team_a_wins' => 0,
            'team_b_wins' => 0,
            'draws' => 0,
            'team_a_goals' => 0,
            'team_b_goals' => 0,
            'last_meeting_at' => null,
            'raw_data' => $response,
        ];

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

            if ($homeTeamIdForMatch === $teamAId) {
                $summary['team_a_goals'] += $homeGoals;
                $summary['team_b_goals'] += $awayGoals;
                $teamAGoals = $homeGoals;
                $teamBGoals = $awayGoals;
            } elseif ($awayTeamIdForMatch === $teamAId) {
                $summary['team_a_goals'] += $awayGoals;
                $summary['team_b_goals'] += $homeGoals;
                $teamAGoals = $awayGoals;
                $teamBGoals = $homeGoals;
            } else {
                continue;
            }

            $summary['total_matches']++;

            if ($teamAGoals === $teamBGoals) {
                $summary['draws']++;
            } elseif ($teamAGoals > $teamBGoals) {
                $summary['team_a_wins']++;
            } else {
                $summary['team_b_wins']++;
            }

            $fixtureDate = data_get($fixtureData, 'fixture.date');

            if (is_string($fixtureDate) && $fixtureDate !== '') {
                $finishedMatchDates[] = CarbonImmutable::parse($fixtureDate);
            }
        }

        if ($finishedMatchDates !== []) {
            $summary['last_meeting_at'] = Carbon::instance(
                collect($finishedMatchDates)
                    ->sortDesc()
                    ->first()
                    ->toMutable(),
            );
        }

        return $summary;
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
