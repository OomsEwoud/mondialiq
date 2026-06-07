<?php

namespace App\Services;

class TeamStatisticAttributesMapper
{
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

    private function baseStatisticAttributes(int $apiTeamId, int $apiLeagueId, int $season, ?string $date): array
    {
        return [
            'api_team_id' => $apiTeamId,
            'api_league_id' => $apiLeagueId,
            'season' => $season,
            'statistics_date' => $date,
            'statistics_key' => "{$apiTeamId}-{$apiLeagueId}-{$season}-" . ($date ?? 'season'),
        ];
    }

    private function matchResultAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'fixtures_played', 'fixtures.played'),
            ...$this->splitIntAttributes($response, 'wins', 'fixtures.wins'),
            ...$this->splitIntAttributes($response, 'draws', 'fixtures.draws'),
            ...$this->splitIntAttributes($response, 'losses', 'fixtures.loses'),
        ];
    }

    private function scoringAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'goals_for', 'goals.for.total'),
            ...$this->splitNullableFloatAttributes($response, 'goals_for_avg', 'goals.for.average'),
            ...$this->splitIntAttributes($response, 'goals_against', 'goals.against.total'),
            ...$this->splitNullableFloatAttributes($response, 'goals_against_avg', 'goals.against.average'),
        ];
    }

    private function availabilityAttributes(array $response): array
    {
        return [
            ...$this->splitIntAttributes($response, 'clean_sheets', 'clean_sheet'),
            ...$this->splitIntAttributes($response, 'failed_to_score', 'failed_to_score'),
        ];
    }

    private function streakAttributes(array $response): array
    {
        return [
            'biggest_wins_streak' => $this->toInt(data_get($response, 'biggest.streak.wins')),
            'biggest_draws_streak' => $this->toInt(data_get($response, 'biggest.streak.draws')),
            'biggest_losses_streak' => $this->toInt(data_get($response, 'biggest.streak.loses')),
        ];
    }

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

    private function splitIntAttributes(array $response, string $prefix, string $path): array
    {
        return [
            "{$prefix}_home" => $this->toInt(data_get($response, "{$path}.home")),
            "{$prefix}_away" => $this->toInt(data_get($response, "{$path}.away")),
            "{$prefix}_total" => $this->toInt(data_get($response, "{$path}.total")),
        ];
    }

    private function splitNullableFloatAttributes(array $response, string $prefix, string $path): array
    {
        return [
            "{$prefix}_home" => $this->toNullableFloat(data_get($response, "{$path}.home")),
            "{$prefix}_away" => $this->toNullableFloat(data_get($response, "{$path}.away")),
            "{$prefix}_total" => $this->toNullableFloat(data_get($response, "{$path}.total")),
        ];
    }

    private function toInt(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    private function toNullableFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private function normalizeArray(mixed $value): ?array
    {
        return is_array($value) ? $value : null;
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
