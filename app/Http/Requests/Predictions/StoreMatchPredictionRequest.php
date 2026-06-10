<?php

namespace App\Http\Requests\Predictions;

use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use Carbon\CarbonImmutable;
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

        if ($fixture !== null) {
            if (CarbonImmutable::parse($fixture->kickoffAt())->isPast()) {
                $validator->errors()->add(
                    'outcome',
                    'Predictions are closed for matches that have already started.',
                );
            } else {
                $prediction = $fixture->predictions()->where('user_id', $this->user()->id)->first();
                if ($prediction !== null && $prediction->validated_at !== null) {
                    $validator->errors()->add(
                        'outcome',
                        'This prediction has already been validated and cannot be edited.',
                    );
                }
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

        if (! ($scoreboard->scoringRule('boosted_predictions_enabled') ?? false)) {
            $validator->errors()->add(
                'is_boosted',
                'Boosted predictions are not enabled for this leaderboard.',
            );

            return;
        }

        $userId = (int) $this->user()->id;
        $fixture = $this->route('fixture');

        $alreadyBoosted = ScoreboardPrediction::query()
            ->where('scoreboard_id', $scoreboardId)
            ->whereHas('prediction', fn ($q) => $q
                ->where('user_id', $userId)
                ->where('fixture_id', $fixture?->id)
            )
            ->where('is_boosted', true)
            ->exists();

        if ($alreadyBoosted) {
            return;
        }

        $boostedCount = ScoreboardPrediction::query()
            ->where('scoreboard_id', $scoreboardId)
            ->whereHas('prediction', fn ($q) => $q->where('user_id', $userId))
            ->where('is_boosted', true)
            ->count();

        $limit = (int) $scoreboard->scoringRule('boosted_predictions_limit', 3);

        if ($boostedCount >= $limit) {
            $validator->errors()->add(
                'is_boosted',
                "You have already used all {$limit} boosted predictions in this leaderboard.",
            );
        }
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
