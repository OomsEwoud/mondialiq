<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use Illuminate\Support\Arr;
use JsonException;
use OpenAI\Laravel\Facades\OpenAI;
use RuntimeException;

class AiPredictionService
{
    private const MODEL = 'gpt-5.4-mini';

    private const SCORE_PATTERN = '/^(?<home>\d+(?:\.\d+)?)\s*[-:]\s*(?<away>\d+(?:\.\d+)?)$/';

    public function __construct(
        private readonly AiPredictionPromptBuilder $promptBuilder,
    ) {
    }

    public function predict(Fixture $fixture): Prediction
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);

        $response = OpenAI::responses()->create($this->openAiParameters($fixture));

        $prediction = $this->decodePrediction($response->outputText);

        return Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixture),
            $this->predictionAttributes($fixture, $prediction),
        );
    }

    /**
     * @return array{model: string, instructions: string, input: string}
     */
    private function openAiParameters(Fixture $fixture): array
    {
        return [
            'model' => self::MODEL,
            'instructions' => $this->promptBuilder->instructions(),
            'input' => $this->promptBuilder->context($fixture),
        ];
    }

    /**
     * @return array{fixture_id: int, user_id: null, source: string}
     */
    private function predictionIdentity(Fixture $fixture): array
    {
        return [
            'fixture_id' => $fixture->id,
            'user_id' => null,
            'source' => PredictionTypes::Ai->value,
        ];
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
        $cleanedOutputText = trim($outputText);

        if (! str_starts_with($cleanedOutputText, '```')) {
            return $cleanedOutputText;
        }

        $cleanedOutputText = preg_replace('/^```(?:json)?\s*/', '', $cleanedOutputText) ?? $cleanedOutputText;

        return trim(preg_replace('/\s*```$/', '', $cleanedOutputText) ?? $cleanedOutputText);
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
            'total_goals' => $this->totalGoals($homeGoals, $awayGoals),
            'advice' => $this->advice($prediction),
        ];
    }

    private function winnerId(Fixture $fixture, mixed $predictedOutcome): ?int
    {
        return match ($predictedOutcome) {
            'home', 'home_or_draw' => $fixture->home_team_id,
            'away', 'away_or_draw' => $fixture->away_team_id,
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
        if (is_string($score) && preg_match(self::SCORE_PATTERN, $score, $matches) === 1) {
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

    private function totalGoals(?float $homeGoals, ?float $awayGoals): ?float
    {
        if ($homeGoals === null || $awayGoals === null) {
            return null;
        }

        return $homeGoals + $awayGoals;
    }

    /**
     * @param  array<string, mixed>  $prediction
     */
    private function advice(array $prediction): string
    {
        $outcome = Arr::get($prediction, 'predicted_outcome', 'unknown');
        $explanation = Arr::get($prediction, 'explanation', 'No explanation provided.');

        return "AI outcome: {$outcome}. {$explanation}";
    }
}
