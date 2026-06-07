<?php

namespace App\Services;

use App\Models\HeadToHead;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use InvalidArgumentException;

class HeadToHeadService
{
    public const REFRESH_AFTER_DAYS = 90;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly HeadToHeadSummaryCalculator $summaryCalculator,
    ) {}

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

        $summary = $this->summaryCalculator->calculateSummary(
            $this->api->getHeadToHead($teamAExternalId, $teamBExternalId),
            $teamAId,
            $teamBId,
        );

        return HeadToHead::query()->updateOrCreate(
            $this->headToHeadIdentity($pairKey),
            $this->headToHeadAttributes($summary, $teamAId, $teamBId),
        );
    }

    public function calculateSummary(array $response, int $teamAId, int $teamBId): array
    {
        return $this->summaryCalculator->calculateSummary($response, $teamAId, $teamBId);
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
}
