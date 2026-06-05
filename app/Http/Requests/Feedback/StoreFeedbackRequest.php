<?php

namespace App\Http\Requests\Feedback;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackRequest extends FormRequest
{
    public const CATEGORIES = [
        'Wrong match data',
        'Wrong score or status',
        'Wrong prediction',
        'Points or leaderboard issue',
        'UI bug or glitch',
        'Account issue',
        'Suggestion',
        'Other',
    ];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'string', Rule::in(self::CATEGORIES)],
            'subject' => ['required', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:5000'],
            'related_url' => ['nullable', 'string', 'max:255'],
        ];
    }
}
