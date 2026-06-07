<?php

namespace App\Services\Fixture;

use Carbon\CarbonImmutable;
use Throwable;

class FixtureOddsPayloadNormalizer
{
    private const IMPORTANT_MARKETS = [
        'Match Winner',
        'Goals Over/Under',
        'Both Teams Score',
        'Exact Score',
        'Total - Home',
        'Total - Away',
        'Home Team Exact Goals Number',
        'Away Team Exact Goals Number',
    ];

    public function bookmakerPayload(mixed $bookmakerData): ?array
    {
        $externalBookmakerId = data_get($bookmakerData, 'id');
        $bookmakerName = data_get($bookmakerData, 'name');

        if (! is_numeric($externalBookmakerId) || blank($bookmakerName)) {
            return null;
        }

        return [
            'external_id' => (int) $externalBookmakerId,
            'name' => (string) $bookmakerName,
            'bets' => data_get($bookmakerData, 'bets', []),
        ];
    }

    public function betPayload(mixed $betData): ?array
    {
        $externalBetId = data_get($betData, 'id');
        $betName = data_get($betData, 'name');

        if (! is_numeric($externalBetId) || blank($betName) || ! $this->isImportantMarket((string) $betName)) {
            return null;
        }

        return [
            'external_id' => (int) $externalBetId,
            'name' => (string) $betName,
            'values' => data_get($betData, 'values', []),
        ];
    }

    public function valuePayload(mixed $valueData): ?array
    {
        $value = data_get($valueData, 'value');
        $odd = $this->normalizeOdd(data_get($valueData, 'odd'));

        if (! is_scalar($value) || blank($value) || $odd === null) {
            return null;
        }

        return [
            'value' => (string) $value,
            'odd' => $odd,
        ];
    }

    public function apiUpdatedAt(?string $updatedAt): ?CarbonImmutable
    {
        if (blank($updatedAt)) {
            return null;
        }

        try {
            return CarbonImmutable::parse($updatedAt);
        } catch (Throwable) {
            return null;
        }
    }

    public function normalizeOdd(mixed $odd): ?float
    {
        if (! is_numeric($odd)) {
            return null;
        }

        $normalizedOdd = (float) $odd;

        return $normalizedOdd > 0 ? $normalizedOdd : null;
    }

    private function isImportantMarket(string $betName): bool
    {
        return in_array($betName, self::IMPORTANT_MARKETS, true);
    }
}
