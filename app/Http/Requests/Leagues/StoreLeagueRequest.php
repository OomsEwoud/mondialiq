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

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->user()?->scoreboards()->count() >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER) {
                    $validator->errors()->add(
                        'name',
                        'You can join up to 5 leagues.'
                    );
                }
            },
        ];
    }
}
