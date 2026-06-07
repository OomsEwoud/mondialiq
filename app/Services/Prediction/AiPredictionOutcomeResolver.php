<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use Illuminate\Support\Arr;

class AiPredictionOutcomeResolver
{
    public function __construct(
        private readonly AiPredictionOutcomeHelper $outcomeHelper,
    ) {}

    public function resolvePredictedOutcome(
        Fixture $fixture,
        ?string $modelOutcome,
        ?string $scoreOutcome,
        array $context,
    ): string {
        if (in_array($modelOutcome, ['home_or_draw', 'away_or_draw', 'home_or_away'], true)) {
            return $this->resolveAmbiguousOutcome($modelOutcome, $context, $scoreOutcome);
        }

        if ($modelOutcome !== null) {
            return $modelOutcome;
        }

        if ($scoreOutcome !== null) {
            return $scoreOutcome;
        }

        return $this->strongestContextOutcome($fixture, $context);
    }

    public function shouldTrustScoreOutcome(
        string $predictedOutcome,
        string $scoreOutcome,
        array $context,
    ): bool {
        $marketScore = $this->parseMarketMostLikelyScore(
            Arr::get($context, 'market_odds.most_likely_score'),
        );
        $marketScoreOutcome = $marketScore
            ? $this->outcomeHelper->getOutcomeFromScore($marketScore[0], $marketScore[1])
            : null;
        $contextOutcome = $this->preferredOutcomeBetween(
            [$predictedOutcome, $scoreOutcome],
            $context,
        );

        return $marketScoreOutcome === $scoreOutcome
            && $contextOutcome === $scoreOutcome;
    }

    public function hasHighGoalExpectation(array $context): bool
    {
        $over = (float) (Arr::get($context, 'market_odds.over_2_5_probability') ?? 0);
        $btts = (float) (Arr::get($context, 'market_odds.btts_yes_probability') ?? 0);

        return $over >= 58 || ($over >= 50 && $btts >= 55);
    }

    public function hasLowGoalExpectation(array $context): bool
    {
        $over = (float) (Arr::get($context, 'market_odds.over_2_5_probability') ?? 0);
        $btts = (float) (Arr::get($context, 'market_odds.btts_yes_probability') ?? 0);

        return $over > 0 && $over <= 40 && $btts <= 45;
    }

    public function parseMarketMostLikelyScore(?string $score): ?array
    {
        if ($score === null || preg_match('/^(?<home>\d+)\s*[-:]\s*(?<away>\d+)$/', trim($score), $matches) !== 1) {
            return null;
        }

        return [(int) $matches['home'], (int) $matches['away']];
    }

    private function resolveAmbiguousOutcome(
        string $outcome,
        array $context,
        ?string $scoreOutcome,
    ): string {
        $preferredOutcome = match ($outcome) {
            'home_or_draw' => $this->preferredOutcomeBetween(['home', 'draw'], $context),
            'away_or_draw' => $this->preferredOutcomeBetween(['away', 'draw'], $context),
            'home_or_away' => $this->preferredOutcomeBetween(['home', 'away'], $context),
            default => 'draw',
        };

        return $preferredOutcome;
    }

    private function preferredOutcomeBetween(array $outcomes, array $context): string
    {
        $scores = [];

        foreach ($outcomes as $outcome) {
            $scores[$outcome] = $this->signalScoreForOutcome($outcome, $context);
        }

        arsort($scores);

        return (string) array_key_first($scores);
    }

    private function strongestContextOutcome(Fixture $fixture, array $context): string
    {
        $scores = [
            'home' => $this->signalScoreForOutcome('home', $context),
            'draw' => $this->signalScoreForOutcome('draw', $context),
            'away' => $this->signalScoreForOutcome('away', $context),
        ];

        $apiAdviceOutcome = $this->apiAdviceOutcome($fixture, $context);

        if ($apiAdviceOutcome === 'home') {
            $scores['home'] += 12;
        }

        if ($apiAdviceOutcome === 'away') {
            $scores['away'] += 12;
        }

        if ($apiAdviceOutcome === 'home_or_draw') {
            $scores['home'] += 10;
            $scores['draw'] += 5;
        }

        if ($apiAdviceOutcome === 'away_or_draw') {
            $scores['away'] += 10;
            $scores['draw'] += 5;
        }

        arsort($scores);

        return (string) array_key_first($scores);
    }

    private function signalScoreForOutcome(string $outcome, array $context): float
    {
        $marketWeight = 1.6;
        $apiWeight = 0.7;

        $marketScore = match ($outcome) {
            'home' => (float) (Arr::get($context, 'market_odds.home_win_probability') ?? 0),
            'draw' => (float) (Arr::get($context, 'market_odds.draw_probability') ?? 0),
            'away' => (float) (Arr::get($context, 'market_odds.away_win_probability') ?? 0),
            default => 0.0,
        };

        $apiScore = match ($outcome) {
            'home' => (float) (Arr::get($context, 'api_prediction.api_home_chance') ?? 0),
            'draw' => (float) (Arr::get($context, 'api_prediction.api_draw_chance') ?? 0),
            'away' => (float) (Arr::get($context, 'api_prediction.api_away_chance') ?? 0),
            default => 0.0,
        };

        return ($marketScore * $marketWeight) + ($apiScore * $apiWeight);
    }

    private function apiAdviceOutcome(Fixture $fixture, array $context): ?string
    {
        $advice = (string) (Arr::get($context, 'api_prediction.api_predicted_outcome') ?? '');
        $advice = mb_strtolower(trim($advice));

        if ($advice === '') {
            return null;
        }

        $homeNeedle = mb_strtolower($fixture->homeTeam?->name ?? '');
        $awayNeedle = mb_strtolower($fixture->awayTeam?->name ?? '');

        if (str_contains($advice, 'draw')) {
            if ($homeNeedle !== '' && str_contains($advice, $homeNeedle)) {
                return 'home_or_draw';
            }

            if ($awayNeedle !== '' && str_contains($advice, $awayNeedle)) {
                return 'away_or_draw';
            }

            return 'draw';
        }

        if ($homeNeedle !== '' && str_contains($advice, $homeNeedle)) {
            return 'home';
        }

        if ($awayNeedle !== '' && str_contains($advice, $awayNeedle)) {
            return 'away';
        }

        return null;
    }
}
