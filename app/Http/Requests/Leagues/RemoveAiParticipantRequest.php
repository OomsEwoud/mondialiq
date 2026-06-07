<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RemoveAiParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', $this->route('scoreboard')) ?? false;
    }

    public function rules(): array
    {
        return [];
    }

    public function after(): array
    {
        return [$this->validateAiIsMember(...)];
    }

    private function validateAiIsMember(Validator $validator): void
    {
        $scoreboard = $this->route('scoreboard');
        $aiUser = User::aiUser();

        if ($aiUser === null) {
            $validator->errors()->add('ai', 'The AI participant is not configured.');

            return;
        }

        if ($scoreboard instanceof Scoreboard && ! $scoreboard->users()->whereKey($aiUser->id)->exists()) {
            $validator->errors()->add('ai', 'The AI participant is not in this group.');
        }
    }
}
