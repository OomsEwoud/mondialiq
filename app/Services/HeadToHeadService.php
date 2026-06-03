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

        return $this->pairKeyForNormalizedTeams($normalizedTeamAId, $normalizedTeamBId);
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
        $pairKey = $this->pairKeyForNormalizedTeams($teamAId, $teamBId);

        $existingHeadToHead = $this->headToHeadForPair($pairKey);

        if (! $force && $this->isFresh($existingHeadToHead)) {
            return $existingHeadToHead;
        }

        [$teamAExternalId, $teamBExternalId] = $this->externalTeamIdsForPair($teamAId, $teamBId);

        $summary = $this->calculateSummary(
            $this->api->getHeadToHead($teamAExternalId, $teamBExternalId),
            $teamAId,
            $teamBId,
        );

        return HeadToHead::query()->updateOrCreate(
            $this->headToHeadIdentity($pairKey),
            $this->headToHeadAttributes($summary, $teamAId, $teamBId),
        );
    }

    private function headToHeadForPair(string $pairKey): ?HeadToHead
    {
        return HeadToHead::query()->where('pair_key', $pairKey)->first();
    }

    private function isFresh(?HeadToHead $headToHead): bool
    {
        return (bool) $headToHead?->fetched_at?->gte(now()->subDays(self::REFRESH_AFTER_DAYS));
    }

    private function externalTeamIdsForPair(int $teamAId, int $teamBId): array
    {
        $externalIds = Team::query()
            ->whereKey([$teamAId, $teamBId])
            ->pluck('external_id', 'id');

        $teamAExternalId = $externalIds[$teamAId] ?? null;
        $teamBExternalId = $externalIds[$teamBId] ?? null;

        if (! is_numeric($teamAExternalId) || ! is_numeric($teamBExternalId)) {
            throw new InvalidArgumentException('Teams missen een geldige external_id voor head-to-head import.');
        }

        return [(int) $teamAExternalId, (int) $teamBExternalId];
    }

    private function headToHeadIdentity(string $pairKey): array
    {
        return [
            'pair_key' => $pairKey,
        ];
    }

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

    public function calculateSummary(array $response, int $teamAId, int $teamBId): array
    {
        $teamIdsByExternalId = $this->teamIdsByExternalId($response);
        $summary = $this->emptySummary($response);
        $finishedMatchDates = [];

        foreach ($response as $fixtureData) {
            $matchSummary = $this->finishedMatchSummary($fixtureData, $teamIdsByExternalId, $teamAId);

            if ($matchSummary === null) {
                continue;
            }

            [$teamAGoals, $teamBGoals, $fixtureDate] = $matchSummary;
            $summary['total_matches']++;
            $summary['team_a_goals'] += $teamAGoals;
            $summary['team_b_goals'] += $teamBGoals;

            $summary = $this->recordResult($summary, $teamAGoals, $teamBGoals);

            if ($fixtureDate !== null) {
                $finishedMatchDates[] = $fixtureDate;
            }
        }

        $summary['last_meeting_at'] = $this->lastMeetingAt($finishedMatchDates);

        return $summary;
    }

    private function finishedMatchSummary(array $fixtureData, Collection $teamIdsByExternalId, int $teamAId): ?array
    {
        if (data_get($fixtureData, 'fixture.status.short') !== 'FT') {
            return null;
        }

        $teamIdsForMatch = $this->teamIdsForMatch($fixtureData, $teamIdsByExternalId);

        if ($teamIdsForMatch === null) {
            return null;
        }

        [$homeTeamId, $awayTeamId] = $teamIdsForMatch;
        $goalsForMatch = $this->goalsForMatch($fixtureData);

        if ($goalsForMatch === null) {
            return null;
        }

        [$homeGoals, $awayGoals] = $goalsForMatch;
        $scoreForTeamA = $this->scoreForTeamA($teamAId, $homeTeamId, $awayTeamId, $homeGoals, $awayGoals);

        if ($scoreForTeamA === null) {
            return null;
        }

        return [
            $scoreForTeamA[0],
            $scoreForTeamA[1],
            $this->fixtureDate($fixtureData),
        ];
    }

    private function teamIdsForMatch(array $fixtureData, Collection $teamIdsByExternalId): ?array
    {
        $homeTeamId = $teamIdsByExternalId[(int) data_get($fixtureData, 'teams.home.id')] ?? null;
        $awayTeamId = $teamIdsByExternalId[(int) data_get($fixtureData, 'teams.away.id')] ?? null;

        if (! is_int($homeTeamId) || ! is_int($awayTeamId)) {
            return null;
        }

        return [$homeTeamId, $awayTeamId];
    }

    private function goalsForMatch(array $fixtureData): ?array
    {
        $homeGoals = $this->normalizeGoals(data_get($fixtureData, 'goals.home'));
        $awayGoals = $this->normalizeGoals(data_get($fixtureData, 'goals.away'));

        if ($homeGoals === null || $awayGoals === null) {
            return null;
        }

        return [$homeGoals, $awayGoals];
    }

    private function fixtureDate(array $fixtureData): ?CarbonImmutable
    {
        $fixtureDate = data_get($fixtureData, 'fixture.date');

        if (! is_string($fixtureDate) || $fixtureDate === '') {
            return null;
        }

        return CarbonImmutable::parse($fixtureDate);
    }

    private function teamIdsByExternalId(array $response): Collection
    {
        return Team::query()
            ->whereIn('external_id', $this->externalTeamIds($response))
            ->pluck('id', 'external_id');
    }

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

    private function normalizeTeamIds(int $teamAId, int $teamBId): array
    {
        if ($teamAId === $teamBId) {
            throw new InvalidArgumentException('Head-to-head import vereist twee verschillende teams.');
        }

        return $teamAId < $teamBId
            ? [$teamAId, $teamBId]
            : [$teamBId, $teamAId];
    }

    private function pairKeyForNormalizedTeams(int $teamAId, int $teamBId): string
    {
        return "{$teamAId}-{$teamBId}";
    }

    private function normalizeGoals(mixed $goals): ?int
    {
        return is_numeric($goals) ? (int) $goals : null;
    }
}
