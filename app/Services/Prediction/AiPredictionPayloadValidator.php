<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class AiPredictionPayloadValidator
{
    public function __construct(
        private readonly AiPredictionOutcomeHelper $outcomeHelper,
        private readonly FixtureOddsSummaryService $fixtureOddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
    ) {}

    public function validateAiPredictionPayload(Fixture $fixture, array $payload): array
    {
        $fixture->loadMissing(['homeTeam:id,name,code', 'awayTeam:id,name,code', 'apiPrediction']);

        $context = $this->buildContext($fixture);
        [$homeScore, $awayScore] = $this->extractScores($payload);
        $originalOutcome = $this->outcomeHelper->getOutcomeFromPredictionData($payload);
        $scoreOutcome = $this->outcomeHelper->getOutcomeFromScore($homeScore, $awayScore);

        $predictedOutcome = $this->resolvePredictedOutcome(
            $fixture,
            $originalOutcome,
            $scoreOutcome,
            $context,
        );

        if (! $this->outcomeHelper->isOutcomeCompatibleWithScore(
            $predictedOutcome,
            $homeScore,
            $awayScore,
        )) {
            if ($scoreOutcome !== null && $this->shouldTrustScoreOutcome(
                $predictedOutcome,
                $scoreOutcome,
                $context,
            )) {
                $predictedOutcome = $scoreOutcome;
            } else {
                [$homeScore, $awayScore] = $this->makeScoreCompatibleWithOutcome(
                    $predictedOutcome,
                    $homeScore,
                    $awayScore,
                    $context,
                );
            }
        }

        $validated = [
            'predicted_outcome' => $predictedOutcome,
            'predicted_home_score' => $homeScore,
            'predicted_away_score' => $awayScore,
            'expected_score' => $homeScore !== null && $awayScore !== null
                ? "{$homeScore}-{$awayScore}"
                : null,
            'home_chance' => $this->clampPercentage(Arr::get($payload, 'home_chance')),
            'draw_chance' => $this->clampPercentage(Arr::get($payload, 'draw_chance')),
            'away_chance' => $this->clampPercentage(Arr::get($payload, 'away_chance')),
            'confidence' => $this->clampPercentage(Arr::get($payload, 'confidence')),
            'explanation' => $this->stringOrFallback(
                Arr::get($payload, 'explanation'),
                'No explanation provided.'
            ),
            'key_factors' => Arr::wrap(Arr::get($payload, 'key_factors')),
        ];

        if ($this->payloadWasCorrected($payload, $validated)) {
            Log::warning('AI prediction payload corrected', [
                'fixture_id' => $fixture->id,
                'original' => [
                    'predicted_outcome' => Arr::get($payload, 'predicted_outcome'),
                    'predicted_home_score' => Arr::get($payload, 'predicted_home_score'),
                    'predicted_away_score' => Arr::get($payload, 'predicted_away_score'),
                    'expected_score' => Arr::get($payload, 'expected_score'),
                    'confidence' => Arr::get($payload, 'confidence'),
                ],
                'corrected' => [
                    'predicted_outcome' => $validated['predicted_outcome'],
                    'predicted_home_score' => $validated['predicted_home_score'],
                    'predicted_away_score' => $validated['predicted_away_score'],
                    'expected_score' => $validated['expected_score'],
                    'confidence' => $validated['confidence'],
                ],
            ]);
        }

        return $validated;
    }

    public function makeScoreCompatibleWithOutcome(string $outcome, ?int $homeScore, ?int $awayScore, array $context): array
    {
        $marketScore = $this->parseMarketMostLikelyScore(
            Arr::get($context, 'market_odds.most_likely_score'),
        );

        // Most likely score is a signal, not a hard rule.
        if (
            $marketScore !== null
            && $this->outcomeHelper->isOutcomeCompatibleWithScore(
                $outcome,
                $marketScore[0],
                $marketScore[1],
            )
        ) {
            return $marketScore;
        }

        $highGoals = $this->hasHighGoalExpectation($context);
        $lowGoals = $this->hasLowGoalExpectation($context);

        return match ($outcome) {
            'home' => $highGoals ? [2, 1] : [1, 0],
            'away' => $highGoals ? [1, 2] : [0, 1],
            'draw' => $lowGoals ? [0, 0] : ($highGoals ? [2, 2] : [1, 1]),
            default => [$homeScore ?? 1, $awayScore ?? 1],
        };
    }

    private function buildContext(Fixture $fixture): array
    {
        return [
            'market_odds' => $this->fixtureOddsSummaryService->summarize($fixture),
            'api_prediction' => $fixture->apiPrediction
                ? $this->apiPredictionSummaryService->summarize($fixture->apiPrediction)
                : null,
        ];
    }

    private function extractScores(array $payload): array
    {
        $homeScore = $this->nonNegativeInt(Arr::get($payload, 'predicted_home_score'));
        $awayScore = $this->nonNegativeInt(Arr::get($payload, 'predicted_away_score'));

        if ($homeScore !== null || $awayScore !== null) {
            return [$homeScore, $awayScore];
        }

        $expectedScore = Arr::get($payload, 'expected_score');

        if (! is_string($expectedScore) || trim($expectedScore) === '') {
            return [null, null];
        }

        if (preg_match('/^(?<home>\d+)\s*[-:]\s*(?<away>\d+)$/', trim($expectedScore), $matches) !== 1) {
            return [null, null];
        }

        return [
            $this->nonNegativeInt($matches['home']),
            $this->nonNegativeInt($matches['away']),
        ];
    }

    private function resolvePredictedOutcome(
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

    private function shouldTrustScoreOutcome(
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

    private function hasHighGoalExpectation(array $context): bool
    {
        $over = (float) (Arr::get($context, 'market_odds.over_2_5_probability') ?? 0);
        $btts = (float) (Arr::get($context, 'market_odds.btts_yes_probability') ?? 0);

        return $over >= 58 || ($over >= 50 && $btts >= 55);
    }

    private function hasLowGoalExpectation(array $context): bool
    {
        $over = (float) (Arr::get($context, 'market_odds.over_2_5_probability') ?? 0);
        $btts = (float) (Arr::get($context, 'market_odds.btts_yes_probability') ?? 0);

        return $over > 0 && $over <= 40 && $btts <= 45;
    }

    private function parseMarketMostLikelyScore(?string $score): ?array
    {
        if ($score === null || preg_match('/^(?<home>\d+)\s*[-:]\s*(?<away>\d+)$/', trim($score), $matches) !== 1) {
            return null;
        }

        return [(int) $matches['home'], (int) $matches['away']];
    }

    private function nonNegativeInt(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        return max(0, (int) round((float) $value));
    }

    private function clampPercentage(mixed $value): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }

        return max(0, min(100, round((float) $value, 2)));
    }

    private function stringOrFallback(mixed $value, string $fallback): string
    {
        if (! is_string($value) || trim($value) === '') {
            return $fallback;
        }

        return trim($value);
    }

    private function payloadWasCorrected(array $original, array $validated): bool
    {
        $originalHomeScore = $this->nonNegativeInt(Arr::get($original, 'predicted_home_score'));
        $originalAwayScore = $this->nonNegativeInt(Arr::get($original, 'predicted_away_score'));

        if ($originalHomeScore === null && $originalAwayScore === null) {
            [$originalHomeScore, $originalAwayScore] = $this->extractScores($original);
        }

        return $this->outcomeHelper->normalizeOutcome(Arr::get($original, 'predicted_outcome')) !== $validated['predicted_outcome']
            || $originalHomeScore !== $validated['predicted_home_score']
            || $originalAwayScore !== $validated['predicted_away_score']
            || $this->clampPercentage(Arr::get($original, 'confidence')) !== $validated['confidence'];
    }
}
