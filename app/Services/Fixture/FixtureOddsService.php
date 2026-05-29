<?php

namespace App\Services\Fixture;

use App\Models\BetType;
use App\Models\Bookmaker;
use App\Models\FixtureOdd;
use Carbon\CarbonImmutable;
use Throwable;

class FixtureOddsService
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

    public function storeFixtureOdds(array $oddsResponse, int $fixtureId): array
    {
        $summary = $this->emptySummary();

        foreach ($oddsResponse as $fixtureOdds) {
            $apiUpdatedAt = $this->apiUpdatedAt(data_get($fixtureOdds, 'update'));
            $bookmakers = data_get($fixtureOdds, 'bookmakers', []);

            if (! is_iterable($bookmakers)) {
                $summary['skipped']++;

                continue;
            }

            foreach ($bookmakers as $bookmakerData) {
                $summary = $this->mergeSummary(
                    $summary,
                    $this->storeBookmakerOdds($bookmakerData, $fixtureId, $apiUpdatedAt),
                );
            }
        }

        return $summary;
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function storeBookmakerOdds(mixed $bookmakerData, int $fixtureId, ?CarbonImmutable $apiUpdatedAt): array
    {
        $summary = $this->emptySummary();
        $bookmakerPayload = $this->bookmakerPayload($bookmakerData);

        if ($bookmakerPayload === null) {
            $summary['skipped']++;

            return $summary;
        }

        $bookmaker = Bookmaker::query()->firstOrCreate(['name' => $bookmakerPayload['name']]);

        if (! is_iterable($bookmakerPayload['bets'])) {
            $summary['skipped']++;

            return $summary;
        }

        foreach ($bookmakerPayload['bets'] as $betData) {
            $summary = $this->mergeSummary(
                $summary,
                $this->storeBetOdds(
                    $betData,
                    $fixtureId,
                    $bookmakerPayload['external_id'],
                    $bookmaker,
                    $bookmakerPayload['name'],
                    $apiUpdatedAt,
                ),
            );
        }

        return $summary;
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function storeBetOdds(
        mixed $betData,
        int $fixtureId,
        int $externalBookmakerId,
        Bookmaker $bookmaker,
        string $bookmakerName,
        ?CarbonImmutable $apiUpdatedAt,
    ): array {
        $summary = $this->emptySummary();
        $betPayload = $this->betPayload($betData);

        if ($betPayload === null) {
            $summary['skipped']++;

            return $summary;
        }

        $betType = BetType::query()->firstOrCreate(['name' => $betPayload['name']]);

        if (! is_iterable($betPayload['values'])) {
            $summary['skipped']++;

            return $summary;
        }

        foreach ($betPayload['values'] as $valueData) {
            $summary = $this->mergeSummary(
                $summary,
                $this->storeValueOdds(
                    $valueData,
                    $fixtureId,
                    $externalBookmakerId,
                    $betPayload['external_id'],
                    $bookmaker,
                    $bookmakerName,
                    $betType,
                    $betPayload['name'],
                    $apiUpdatedAt,
                ),
            );
        }

        return $summary;
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function storeValueOdds(
        mixed $valueData,
        int $fixtureId,
        int $externalBookmakerId,
        int $externalBetId,
        Bookmaker $bookmaker,
        string $bookmakerName,
        BetType $betType,
        string $betName,
        ?CarbonImmutable $apiUpdatedAt,
    ): array {
        $valuePayload = $this->valuePayload($valueData);

        if ($valuePayload === null) {
            return $this->skippedSummary();
        }

        FixtureOdd::query()->updateOrCreate(
            $this->fixtureOddIdentity($fixtureId, $externalBookmakerId, $externalBetId, $valuePayload['value']),
            $this->fixtureOddAttributes($bookmaker, $bookmakerName, $betType, $betName, $valuePayload['odd'], $apiUpdatedAt),
        );

        return $this->storedSummary();
    }

    /**
     * @return array{external_id: int, name: string, bets: mixed}|null
     */
    private function bookmakerPayload(mixed $bookmakerData): ?array
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

    /**
     * @return array{external_id: int, name: string, values: mixed}|null
     */
    private function betPayload(mixed $betData): ?array
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

    /**
     * @return array{value: string, odd: float}|null
     */
    private function valuePayload(mixed $valueData): ?array
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

    /**
     * @return array{fixture_id: int, external_bookmaker_id: int, external_bet_id: int, value: string}
     */
    private function fixtureOddIdentity(int $fixtureId, int $externalBookmakerId, int $externalBetId, string $value): array
    {
        return [
            'fixture_id' => $fixtureId,
            'external_bookmaker_id' => $externalBookmakerId,
            'external_bet_id' => $externalBetId,
            'value' => $value,
        ];
    }

    /**
     * @return array{bookmaker_id: int, bet_type_id: int, bookmaker_name: string, bet_name: string, odd: float, api_updated_at: ?CarbonImmutable}
     */
    private function fixtureOddAttributes(
        Bookmaker $bookmaker,
        string $bookmakerName,
        BetType $betType,
        string $betName,
        float $odd,
        ?CarbonImmutable $apiUpdatedAt,
    ): array {
        return [
            'bookmaker_id' => $bookmaker->id,
            'bet_type_id' => $betType->id,
            'bookmaker_name' => $bookmakerName,
            'bet_name' => $betName,
            'odd' => $odd,
            'api_updated_at' => $apiUpdatedAt,
        ];
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function emptySummary(): array
    {
        return [
            'stored' => 0,
            'skipped' => 0,
        ];
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function storedSummary(): array
    {
        return [
            'stored' => 1,
            'skipped' => 0,
        ];
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function skippedSummary(): array
    {
        return [
            'stored' => 0,
            'skipped' => 1,
        ];
    }

    /**
     * @param  array{stored: int, skipped: int}  $summary
     * @param  array{stored: int, skipped: int}  $addition
     * @return array{stored: int, skipped: int}
     */
    private function mergeSummary(array $summary, array $addition): array
    {
        $summary['stored'] += $addition['stored'];
        $summary['skipped'] += $addition['skipped'];

        return $summary;
    }

    private function isImportantMarket(string $betName): bool
    {
        return in_array($betName, self::IMPORTANT_MARKETS, true);
    }

    private function normalizeOdd(mixed $odd): ?float
    {
        if (! is_numeric($odd)) {
            return null;
        }

        $normalizedOdd = (float) $odd;

        return $normalizedOdd > 0 ? $normalizedOdd : null;
    }

    private function apiUpdatedAt(?string $updatedAt): ?CarbonImmutable
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
}
