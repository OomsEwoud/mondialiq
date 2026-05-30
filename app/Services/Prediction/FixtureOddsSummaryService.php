<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\FixtureOdd;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class FixtureOddsSummaryService
{
    private const MARKET_MATCH_WINNER = 'Match Winner';
    private const MARKET_GOALS_OVER_UNDER = 'Goals Over/Under';
    private const MARKET_BOTH_TEAMS_SCORE = 'Both Teams Score';
    private const MARKET_EXACT_SCORE = 'Exact Score';
    private const MARKET_TOTAL_HOME = 'Total - Home';
    private const MARKET_TOTAL_AWAY = 'Total - Away';
    private const MARKET_HOME_EXACT_GOALS = 'Home Team Exact Goals Number';
    private const MARKET_AWAY_EXACT_GOALS = 'Away Team Exact Goals Number';

    private const IMPORTANT_MARKETS = [
        self::MARKET_MATCH_WINNER,
        self::MARKET_GOALS_OVER_UNDER,
        self::MARKET_BOTH_TEAMS_SCORE,
        self::MARKET_EXACT_SCORE,
        self::MARKET_TOTAL_HOME,
        self::MARKET_TOTAL_AWAY,
        self::MARKET_HOME_EXACT_GOALS,
        self::MARKET_AWAY_EXACT_GOALS,
    ];

    public function __construct(
        private readonly PromptFormatter $formatter,
    ) {
    }

    public function summarize(Fixture|int $fixture): array
    {
        $fixtureId = $fixture instanceof Fixture ? $fixture->id : $fixture;
        $odds = $this->oddsForFixture($fixtureId);

        $matchWinnerProbabilities = $this->marketProbabilities($odds, self::MARKET_MATCH_WINNER, ['Home', 'Draw', 'Away']);
        $goalsProbabilities = $this->marketProbabilities($odds, self::MARKET_GOALS_OVER_UNDER, ['Over 2.5', 'Under 2.5']);
        $bttsProbabilities = $this->marketProbabilities($odds, self::MARKET_BOTH_TEAMS_SCORE, ['Yes', 'No']);
        $scoreProbabilities = $this->marketProbabilities($odds, self::MARKET_EXACT_SCORE);
        $topScores = $this->topScores($scoreProbabilities);

        return [
            'home_win_probability' => $this->probability($matchWinnerProbabilities, 'Home'),
            'draw_probability' => $this->probability($matchWinnerProbabilities, 'Draw'),
            'away_win_probability' => $this->probability($matchWinnerProbabilities, 'Away'),
            'over_2_5_probability' => $this->probability($goalsProbabilities, 'Over 2.5'),
            'under_2_5_probability' => $this->probability($goalsProbabilities, 'Under 2.5'),
            'btts_yes_probability' => $this->probability($bttsProbabilities, 'Yes'),
            'btts_no_probability' => $this->probability($bttsProbabilities, 'No'),
            'most_likely_score' => $topScores[0]['score'] ?? null,
            'top_scores' => $topScores,
            'top_likely_scores' => $topScores,
        ];
    }

    public function promptBlock(Fixture|int $fixture): string
    {
        $summary = $this->summarize($fixture);

        return implode(PHP_EOL, [
            'Market odds summary:',
            '- Home win probability: '.$this->formatter->percentage($summary['home_win_probability'], round: true),
            '- Draw probability: '.$this->formatter->percentage($summary['draw_probability'], round: true),
            '- Away win probability: '.$this->formatter->percentage($summary['away_win_probability'], round: true),
            '- Over 2.5 goals probability: '.$this->formatter->percentage($summary['over_2_5_probability'], round: true),
            '- BTTS yes probability: '.$this->formatter->percentage($summary['btts_yes_probability'], round: true),
            '- Most likely score according to market: '.$this->formatter->value($summary['most_likely_score']),
        ]);
    }

    private function oddsForFixture(int $fixtureId): EloquentCollection
    {
        return FixtureOdd::query()
            ->with('betType:id,name')
            ->where('fixture_id', $fixtureId)
            ->where(function (Builder $query) {
                $query
                    ->whereIn('bet_name', self::IMPORTANT_MARKETS)
                    ->orWhereHas('betType', fn (Builder $query) => $query->whereIn('name', self::IMPORTANT_MARKETS));
            })
            ->get([
                'id',
                'bookmaker_id',
                'bet_type_id',
                'external_bookmaker_id',
                'bookmaker_name',
                'bet_name',
                'value',
                'odd',
            ]);
    }

    private function marketProbabilities(EloquentCollection $odds, string $market, ?array $requiredValues = null): Collection
    {
        return $odds
            ->filter(fn (FixtureOdd $odd): bool => $this->marketName($odd) === $market)
            ->groupBy(fn (FixtureOdd $odd): string => $this->bookmakerKey($odd))
            ->map(fn (Collection $bookmakerOdds): Collection => $this->normalizeBookmakerProbabilities($bookmakerOdds, $requiredValues))
            ->filter(fn (Collection $probabilities): bool => $probabilities->isNotEmpty())
            ->flatMap(fn (Collection $probabilities): array => $probabilities->all())
            ->groupBy('value')
            ->map(fn (Collection $probabilities): float => round($probabilities->avg('probability'), 2));
    }

    private function normalizeBookmakerProbabilities(Collection $odds, ?array $requiredValues): Collection
    {
        $impliedProbabilities = $odds
            ->filter(fn (FixtureOdd $odd): bool => $odd->odd > 0)
            ->map(fn (FixtureOdd $odd): array => [
                'value' => $this->normalizeValue($odd->value),
                'probability' => 100 / $odd->odd,
            ]);

        if ($requiredValues !== null) {
            $requiredValues = collect($requiredValues)
                ->map(fn (string $value): string => $this->normalizeValue($value))
                ->all();

            $impliedProbabilities = $impliedProbabilities
                ->whereIn('value', $requiredValues)
                ->values();

            if ($impliedProbabilities->pluck('value')->unique()->count() !== count($requiredValues)) {
                return collect();
            }
        }

        $totalProbability = $impliedProbabilities->sum('probability');

        if ($totalProbability <= 0) {
            return collect();
        }

        return $impliedProbabilities->map(fn (array $probability): array => [
            'value' => $probability['value'],
            'probability' => ($probability['probability'] / $totalProbability) * 100,
        ]);
    }

    private function topScores(Collection $scoreProbabilities): array
    {
        return $scoreProbabilities
            ->map(fn (float $probability, string $score): array => [
                'score' => $score,
                'probability' => $probability,
            ])
            ->sortByDesc('probability')
            ->take(5)
            ->values()
            ->all();
    }

    private function probability(Collection $probabilities, string $value): ?float
    {
        return $probabilities->get($this->normalizeValue($value));
    }

    private function bookmakerKey(FixtureOdd $odd): string
    {
        return (string) ($odd->external_bookmaker_id ?? $odd->bookmaker_id ?? $odd->bookmaker_name);
    }

    private function marketName(FixtureOdd $odd): ?string
    {
        return $odd->bet_name ?? $odd->betType?->name;
    }

    private function normalizeValue(string $value): string
    {
        return trim($value);
    }
}
