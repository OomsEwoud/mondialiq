<?php

namespace App\Services\Fixture;

use App\Models\BetType;
use App\Models\Bookmaker;
use App\Models\FixtureOdd;
use Carbon\CarbonImmutable;

class FixtureOddsService
{
    public function __construct(
        private readonly FixtureOddsPayloadNormalizer $normalizer,
    ) {}

    public function storeFixtureOdds(array $oddsResponse, int $fixtureId): array
    {
        $summary = $this->emptySummary();

        foreach ($oddsResponse as $fixtureOdds) {
            $apiUpdatedAt = $this->normalizer->apiUpdatedAt(data_get($fixtureOdds, 'update'));
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

    private function storeBookmakerOdds(mixed $bookmakerData, int $fixtureId, ?CarbonImmutable $apiUpdatedAt): array
    {
        $summary = $this->emptySummary();
        $bookmakerPayload = $this->normalizer->bookmakerPayload($bookmakerData);

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

    private function storeBetOdds(
        mixed $betData,
        int $fixtureId,
        int $externalBookmakerId,
        Bookmaker $bookmaker,
        string $bookmakerName,
        ?CarbonImmutable $apiUpdatedAt,
    ): array {
        $summary = $this->emptySummary();
        $betPayload = $this->normalizer->betPayload($betData);

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
        $valuePayload = $this->normalizer->valuePayload($valueData);

        if ($valuePayload === null) {
            return $this->skippedSummary();
        }

        FixtureOdd::query()->updateOrCreate(
            $this->fixtureOddIdentity($fixtureId, $externalBookmakerId, $externalBetId, $valuePayload['value']),
            $this->fixtureOddAttributes($bookmaker, $bookmakerName, $betType, $betName, $valuePayload['odd'], $apiUpdatedAt),
        );

        return $this->storedSummary();
    }

    private function fixtureOddIdentity(int $fixtureId, int $externalBookmakerId, int $externalBetId, string $value): array
    {
        return [
            'fixture_id' => $fixtureId,
            'external_bookmaker_id' => $externalBookmakerId,
            'external_bet_id' => $externalBetId,
            'value' => $value,
        ];
    }

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

    private function emptySummary(): array
    {
        return [
            'stored' => 0,
            'skipped' => 0,
        ];
    }

    private function storedSummary(): array
    {
        return [
            'stored' => 1,
            'skipped' => 0,
        ];
    }

    private function skippedSummary(): array
    {
        return [
            'stored' => 0,
            'skipped' => 1,
        ];
    }

    private function mergeSummary(array $summary, array $addition): array
    {
        $summary['stored'] += $addition['stored'];
        $summary['skipped'] += $addition['skipped'];

        return $summary;
    }
}
