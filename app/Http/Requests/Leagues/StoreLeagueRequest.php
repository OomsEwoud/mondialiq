<?php

namespace App\Http\Requests\Leagues;

use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLeagueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1000'],
            'reward_title' => ['nullable', 'string', 'max:120'],
            'reward_description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'string', 'in:private,public'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [$this->validateLeagueLimit(...)];
    }

    private function validateLeagueLimit(Validator $validator): void
    {
        if ($this->user()?->scoreboards()->count() < LeagueMembershipLimit::MAX_LEAGUES_PER_USER) {
            return;
        }

        $validator->errors()->add(
            'name',
            'You can join up to 5 leagues.',
        );
    }
}
