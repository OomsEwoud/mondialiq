<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use App\Support\Leagues\LeagueMembershipLimit;
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

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:8'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->has('code')) {
                    return;
                }

                $league = Scoreboard::query()
                    ->where('code', $this->string('code')->toString())
                    ->first();

                if (! $league) {
                    $validator->errors()->add('code', 'This invite code is invalid.');

                    return;
                }

                if ($this->user()->scoreboards()->count() >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER) {
                    $validator->errors()->add('code', 'You can join up to 5 leagues.');

                    return;
                }

                if ($league->users()->whereKey($this->user()->id)->exists()) {
                    $validator->errors()->add('code', 'You already joined this league.');
                }
            },
        ];
    }
}
