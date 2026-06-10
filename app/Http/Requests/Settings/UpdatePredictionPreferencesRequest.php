<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePredictionPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'predictions_visibility' => ['required', Rule::in(['public', 'private'])],
            'default_prediction_visibility' => ['required', Rule::in(['public', 'private'])],
            'show_on_leaderboards' => ['required', 'boolean'],
            'allow_group_visibility' => ['required', 'boolean'],
        ];
    }
}
