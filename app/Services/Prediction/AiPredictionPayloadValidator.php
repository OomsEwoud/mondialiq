<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class AiPredictionPayloadValidator
{
    public function __construct(
        private readonly AiPredictionOutcomeHelper $outcomeHelper,
        private readonly AiPredictionOutcomeResolver $outcomeResolver,
        private readonly AiPredictionPayloadNormalizer $normalizer,
        private readonly FixtureOddsSummaryService $fixtureOddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
    ) {}

    public function validateAiPredictionPayload(Fixture $fixture, array $payload): array
    {
        $fixture->loadMissing(['homeTeam:id,name,code', 'awayTeam:id,name,code', 'apiPrediction']);

        $context = $this->buildContext($fixture);
        [$homeScore, $awayScore] = $this->normalizer->extractScores($payload);
        $originalOutcome = $this->outcomeHelper->getOutcomeFromPredictionData($payload);
        $scoreOutcome = $this->outcomeHelper->getOutcomeFromScore($homeScore, $awayScore);

        $predictedOutcome = $this->outcomeResolver->resolvePredictedOutcome(
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
            if ($scoreOutcome !== null && $this->outcomeResolver->shouldTrustScoreOutcome(
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
            'home_chance' => $this->normalizer->clampPercentage(Arr::get($payload, 'home_chance')),
            'draw_chance' => $this->normalizer->clampPercentage(Arr::get($payload, 'draw_chance')),
            'away_chance' => $this->normalizer->clampPercentage(Arr::get($payload, 'away_chance')),
            'confidence' => $this->normalizer->clampPercentage(Arr::get($payload, 'confidence')),
            'explanation' => $this->normalizer->stringOrFallback(
                Arr::get($payload, 'explanation'),
                'No explanation provided.'
            ),
            'key_factors' => Arr::wrap(Arr::get($payload, 'key_factors')),
        ];

        if ($this->normalizer->payloadWasCorrected($payload, $validated)) {
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
        $marketScore = $this->normalizer->parseMarketMostLikelyScore(
            Arr::get($context, 'market_odds.most_likely_score'),
        );

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

        $highGoals = $this->outcomeResolver->hasHighGoalExpectation($context);
        $lowGoals = $this->outcomeResolver->hasLowGoalExpectation($context);

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
}
