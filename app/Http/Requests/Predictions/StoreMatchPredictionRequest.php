<?php

namespace App\Http\Requests\Predictions;

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
        return [
            function (Validator $validator) {
                $fixture = $this->route('fixture');

                if ($fixture && $fixture->match_date->isPast()) {
                    $validator->errors()->add(
                        'outcome',
                        'Predictions are closed for matches that have already started.',
                    );
                }
            },
        ];
    }
}
