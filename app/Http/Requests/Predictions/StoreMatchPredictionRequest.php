<?php

namespace App\Http\Requests\Predictions;

use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreMatchPredictionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'outcome' => ['required', Rule::in(['home', 'draw', 'away'])],
            'home_score' => ['nullable', 'integer', 'min:0', 'max:99'],
            'away_score' => ['nullable', 'integer', 'min:0', 'max:99'],
            'confidence' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'scoreboard_id' => ['nullable', 'integer', 'exists:scoreboards,id'],
            'is_boosted' => ['nullable', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            $this->validatePredictionRules(...),
            $this->validateBoostRules(...),
        ];
    }

    private function validatePredictionRules(Validator $validator): void
    {
        $fixture = $this->route('fixture');
        $user = $this->user();

        if ($fixture !== null) {
            $worldCupContext = app(\App\Support\WorldCup\WorldCupContext::class);
            $isWorldCup = in_array($fixture->league_id, $worldCupContext->leagueIds(), true)
                && $fixture->season === $worldCupContext->season();

            if (! $isWorldCup) {
                $validator->errors()->add(
                    'outcome',
                    'Predictions are only allowed for World Cup 2026 fixtures.',
                );
                return;
            }

            $prediction = $fixture->predictions()->where('user_id', $user->id)->first();

            if ($prediction) {
                if ($user->cannot('update', $prediction)) {
                    $validator->errors()->add(
                        'outcome',
                        'This prediction can no longer be edited.',
                    );
                }
            } elseif ($fixture->hasStarted()) {
                $validator->errors()->add(
                    'outcome',
                    'Predictions are closed for matches that have already started.',
                );
            }
        }

        if (! $validator->errors()->has('home_score') && ! $validator->errors()->has('away_score')) {
            $this->validateScoreMatchesOutcome($validator);
        }
    }

    private function validateBoostRules(Validator $validator): void
    {
        if (! $this->boolean('is_boosted')) {
            return;
        }

        $scoreboardId = $this->integer('scoreboard_id');

        if ($scoreboardId === 0) {
            $validator->errors()->add(
                'is_boosted',
                'A boosted prediction requires a leaderboard context.',
            );

            return;
        }

        $scoreboard = Scoreboard::find($scoreboardId);

        if ($scoreboard === null) {
            return;
        }

        if (! $scoreboard->boostedPredictionsEnabled()) {
            $validator->errors()->add(
                'is_boosted',
                'Boosted predictions are not enabled for this leaderboard.',
            );

            return;
        }

        $user = $this->user();
        $fixture = $this->route('fixture');

        $alreadyBoosted = ScoreboardPrediction::query()
            ->where('scoreboard_id', $scoreboardId)
            ->whereHas('prediction', fn ($q) => $q
                ->where('user_id', $user->id)
                ->where('fixture_id', $fixture?->id)
            )
            ->where('is_boosted', true)
            ->exists();

        if ($alreadyBoosted) {
            return;
        }

        $remainingBoosts = $scoreboard->remainingBoostsFor($user);

        if ($remainingBoosts <= 0) {
            $limit = $scoreboard->boostedPredictionsLimit();
            $validator->errors()->add(
                'is_boosted',
                "You have already used all {$limit} boosted predictions in this leaderboard.",
            );
        }

        $thresholdString = $scoreboard->boostedConfidenceThreshold();
        $threshold = $this->numericConfidence($thresholdString);
        $userConfidenceString = $this->string('confidence')->toString();
        $userConfidence = $this->numericConfidence($userConfidenceString);

        if ($userConfidence < $threshold) {
            $validator->errors()->add(
                'confidence',
                "A boosted prediction requires at least {$thresholdString} confidence.",
            );
        }
    }

    private function numericConfidence(?string $confidence): int
    {
        return match ($confidence) {
            'high' => 100,
            'medium' => 50,
            'low' => 25,
            default => 0,
        };
    }

    private function validateScoreMatchesOutcome(Validator $validator): void
    {
        if (! $this->filled('home_score') || ! $this->filled('away_score')) {
            return;
        }

        $homeScore = $this->integer('home_score');
        $awayScore = $this->integer('away_score');
        $outcome = $this->string('outcome')->toString();

        $scoreOutcome = match (true) {
            $homeScore > $awayScore => 'home',
            $homeScore < $awayScore => 'away',
            default => 'draw',
        };

        if ($outcome !== $scoreOutcome) {
            $validator->errors()->add(
                'outcome',
                'The selected winner must match the predicted score.',
            );
        }
    }
}
