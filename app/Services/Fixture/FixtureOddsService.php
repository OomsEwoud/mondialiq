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
        $summary = [
            'stored' => 0,
            'skipped' => 0,
        ];

        foreach ($oddsResponse as $fixtureOdds) {
            $apiUpdatedAt = $this->apiUpdatedAt(data_get($fixtureOdds, 'update'));
            $bookmakers = data_get($fixtureOdds, 'bookmakers', []);

            if (! is_iterable($bookmakers)) {
                $summary['skipped']++;

                continue;
            }

            foreach ($bookmakers as $bookmakerData) {
                $externalBookmakerId = data_get($bookmakerData, 'id');
                $bookmakerName = data_get($bookmakerData, 'name');

                if (! is_numeric($externalBookmakerId) || blank($bookmakerName)) {
                    $summary['skipped']++;

                    continue;
                }

                $bookmakerName = (string) $bookmakerName;
                $bookmaker = Bookmaker::query()->firstOrCreate(['name' => $bookmakerName]);
                $bets = data_get($bookmakerData, 'bets', []);

                if (! is_iterable($bets)) {
                    $summary['skipped']++;

                    continue;
                }

                foreach ($bets as $betData) {
                    $externalBetId = data_get($betData, 'id');
                    $betName = data_get($betData, 'name');

                    if (
                        ! is_numeric($externalBetId)
                        || blank($betName)
                        || ! $this->isImportantMarket((string) $betName)
                    ) {
                        $summary['skipped']++;

                        continue;
                    }

                    $betName = (string) $betName;
                    $betType = BetType::query()->firstOrCreate(['name' => $betName]);
                    $values = data_get($betData, 'values', []);

                    if (! is_iterable($values)) {
                        $summary['skipped']++;

                        continue;
                    }

                    foreach ($values as $valueData) {
                        $value = data_get($valueData, 'value');
                        $odd = $this->normalizeOdd(data_get($valueData, 'odd'));

                        if (! is_scalar($value) || blank($value) || $odd === null) {
                            $summary['skipped']++;

                            continue;
                        }

                        FixtureOdd::query()->updateOrCreate(
                            [
                                'fixture_id' => $fixtureId,
                                'external_bookmaker_id' => (int) $externalBookmakerId,
                                'external_bet_id' => (int) $externalBetId,
                                'value' => (string) $value,
                            ],
                            [
                                'bookmaker_id' => $bookmaker->id,
                                'bet_type_id' => $betType->id,
                                'bookmaker_name' => $bookmakerName,
                                'bet_name' => $betName,
                                'odd' => $odd,
                                'api_updated_at' => $apiUpdatedAt,
                            ],
                        );

                        $summary['stored']++;
                    }
                }
            }
        }

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
