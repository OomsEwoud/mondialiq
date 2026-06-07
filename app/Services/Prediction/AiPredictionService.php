<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\User;
use Illuminate\Support\Arr;
use RuntimeException;

class AiPredictionService
{
    private const MODEL = 'gpt-5.4-mini';

    public function __construct(
        private readonly AiPredictionPromptBuilder $promptBuilder,
        private readonly OpenAiResponseClient $openAi,
        private readonly AiPredictionPayloadValidator $payloadValidator,
    ) {}

    public function predict(Fixture $fixture): Prediction
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);

        $response = $this->openAi->create($this->openAiParameters($fixture));

        $prediction = $this->decodePrediction($response->outputText);

        $validatedPrediction = $this->payloadValidator->validateAiPredictionPayload(
            $fixture,
            $prediction,
        );

        return Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixture),
            $this->predictionAttributes($fixture, $validatedPrediction),
        );
    }

    private function openAiParameters(Fixture $fixture): array
    {
        return [
            'model' => self::MODEL,
            'instructions' => $this->promptBuilder->instructions(),
            'input' => $this->promptBuilder->context($fixture),
        ];
    }

    private function predictionIdentity(Fixture $fixture): array
    {
        $aiUser = User::aiUser();

        return [
            'fixture_id' => $fixture->id,
            'user_id' => $aiUser?->id,
            'source' => PredictionTypes::Ai->value,
        ];
    }

    private function decodePrediction(?string $outputText): array
    {
        if (blank($outputText)) {
            throw new RuntimeException('OpenAI response bevat geen prediction output.');
        }

        try {
            $prediction = json_decode($this->cleanJson($outputText), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
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

    private function predictionAttributes(Fixture $fixture, array $prediction): array
    {
        $homeGoals = $this->numericOrNull(Arr::get($prediction, 'predicted_home_score'));
        $awayGoals = $this->numericOrNull(Arr::get($prediction, 'predicted_away_score'));

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

    private function advice(array $prediction): string
    {
        $outcome = Arr::get($prediction, 'predicted_outcome', 'unknown');
        $explanation = Arr::get($prediction, 'explanation', 'No explanation provided.');

        return "AI outcome: {$outcome}. {$explanation}";
    }
}
