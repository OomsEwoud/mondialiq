<?php

namespace App\Http\Requests\Predictions;

use App\Models\Fixture;
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
        ];
    }

    public function after(): array
    {
        return [$this->validatePredictionRules(...)];
    }

    private function validatePredictionRules(Validator $validator): void
    {
        /** @var Fixture|null $fixture */
        $fixture = $this->route('fixture');

        if ($fixture?->match_date?->isPast()) {
            $validator->errors()->add(
                'outcome',
                'Predictions are closed for matches that have already started.',
            );
        }

        if (! $validator->errors()->has('home_score') && ! $validator->errors()->has('away_score')) {
            $this->validateScoreMatchesOutcome($validator);
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
