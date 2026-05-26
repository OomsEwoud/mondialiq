<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use JsonException;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class AiPredictionService
{
    private const ADVICE_MAX_LENGTH = 255;

    public function __construct(
        private readonly AiPredictionPromptBuilder $promptBuilder,
    ) {
    }

    public function predict(Fixture $fixture): Prediction
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);

        $response = OpenAI::responses()->create([
            'model' => 'gpt-5.4-mini',
            'instructions' => $this->promptBuilder->instructions(),
            'input' => $this->promptBuilder->context($fixture),
        ]);

        $prediction = $this->decodePrediction($response->outputText);

        return Prediction::query()->updateOrCreate(
            [
                'fixture_id' => $fixture->id,
                'user_id' => null,
                'source' => PredictionTypes::Ai->value,
            ],
            $this->predictionAttributes($fixture, $prediction),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function decodePrediction(?string $outputText): array
    {
        if (blank($outputText)) {
            throw new RuntimeException('OpenAI response bevat geen prediction output.');
        }

        try {
            $prediction = json_decode($this->cleanJson($outputText), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException("OpenAI response bevat geen geldige JSON: {$exception->getMessage()}", previous: $exception);
        }

        if (! is_array($prediction)) {
            throw new RuntimeException('OpenAI response JSON bevat geen prediction object.');
        }

        return $prediction;
    }

    private function cleanJson(string $outputText): string
    {
        $outputText = trim($outputText);

        if (! str_starts_with($outputText, '```')) {
            return $outputText;
        }

        $outputText = preg_replace('/^```(?:json)?\s*/', '', $outputText) ?? $outputText;

        return trim(preg_replace('/\s*```$/', '', $outputText) ?? $outputText);
    }

    /**
     * @param  array<string, mixed>  $prediction
     * @return array<string, mixed>
     */
    private function predictionAttributes(Fixture $fixture, array $prediction): array
    {
        [$homeGoals, $awayGoals] = $this->scoreFromPrediction(Arr::get($prediction, 'expected_score'));

        return [
            'winner_id' => $this->winnerId($fixture, Arr::get($prediction, 'predicted_outcome')),
            'home_chance' => $this->percentage(Arr::get($prediction, 'home_chance')),
            'draw_chance' => $this->percentage(Arr::get($prediction, 'draw_chance')),
            'away_chance' => $this->percentage(Arr::get($prediction, 'away_chance')),
            'confidence' => $this->percentage(Arr::get($prediction, 'confidence')),
            'home_goals' => $homeGoals,
            'away_goals' => $awayGoals,
            'total_goals' => $homeGoals !== null && $awayGoals !== null ? $homeGoals + $awayGoals : null,
            'advice' => $this->advice($prediction),
        ];
    }

    private function winnerId(Fixture $fixture, mixed $predictedOutcome): ?int
    {
        return match ($predictedOutcome) {
            'home' => $fixture->home_team_id,
            'away' => $fixture->away_team_id,
            default => null,
        };
    }

    private function percentage(mixed $value): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }

        return max(0, min(100, round((float) $value, 2)));
    }

    /**
     * @return array{0: float|null, 1: float|null}
     */
    private function scoreFromPrediction(mixed $score): array
    {
        if (is_string($score) && preg_match('/^(?<home>\d+(?:\.\d+)?)\s*-\s*(?<away>\d+(?:\.\d+)?)$/', $score, $matches)) {
            return [(float) $matches['home'], (float) $matches['away']];
        }

        if (is_array($score)) {
            return [
                $this->numericOrNull($score['home'] ?? null),
                $this->numericOrNull($score['away'] ?? null),
            ];
        }

        return [null, null];
    }

    private function numericOrNull(mixed $value): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    /**
     * @param  array<string, mixed>  $prediction
     */
    private function advice(array $prediction): string
    {
        $outcome = Arr::get($prediction, 'predicted_outcome', 'unknown');
        $explanation = Arr::get($prediction, 'explanation', 'No explanation provided.');

        return Str::limit("AI outcome: {$outcome}. {$explanation}", self::ADVICE_MAX_LENGTH - 3);
    }
}
