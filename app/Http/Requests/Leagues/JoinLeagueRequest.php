<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class JoinLeagueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper(trim((string) $this->input('code'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:8'],
        ];
    }

    public function after(): array
    {
        return [$this->validateLeagueCode(...)];
    }

    private function validateLeagueCode(Validator $validator): void
    {
        if ($validator->errors()->has('code')) {
            return;
        }

        $league = Scoreboard::query()
            ->where('code', $this->string('code')->toString())
            ->first();

        if (! $league) {
            $validator->errors()->add('code', 'This invite code is invalid.');
        }
    }
}
