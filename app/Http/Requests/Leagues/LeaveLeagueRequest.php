<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class LeaveLeagueRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Scoreboard $scoreboard */
        $scoreboard = $this->route('scoreboard');

        return $this->user()?->can('view', $scoreboard) ?? false;
    }

    public function rules(): array
    {
        return [];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                /** @var Scoreboard $scoreboard */
                $scoreboard = $this->route('scoreboard');

                if ($scoreboard->owner_id === $this->user()?->id) {
                    $validator->errors()->add(
                        'league',
                        'The owner cannot leave the league. Delete it instead.'
                    );
                }
            },
        ];
    }
}
