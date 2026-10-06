<?php

namespace App\Http\Requests\Rankings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AiRankingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'competition' => ['nullable', 'integer', 'exists:leagues,id'],
            'team' => ['nullable', 'integer', 'exists:teams,id'],
            'period' => ['nullable', Rule::in(['all', '7d', '30d', '90d', '365d'])],
            'predictionType' => ['nullable', Rule::in(['all', 'outcome', 'exact', 'double_chance'])],
            'confidence' => ['nullable', Rule::in(['all', 'high', 'medium', 'low', 'unknown'])],
        ];
    }
}
