<?php

namespace App\Http\Requests\Leagues;

use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RemoveLeagueMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Scoreboard $scoreboard */
        $scoreboard = $this->route('scoreboard');

        return $this->user()?->can('manage', $scoreboard) ?? false;
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
                /** @var User $member */
                $member = $this->route('member');

                if (! $scoreboard->users()->whereKey($member->id)->exists()) {
                    $validator->errors()->add('member', 'This user is not part of the league.');

                    return;
                }

                if ($member->id === $this->user()->id) {
                    $validator->errors()->add('member', 'You cannot remove yourself from your league.');

                    return;
                }

                if ($member->id === $scoreboard->owner_id) {
                    $validator->errors()->add('member', 'The league owner cannot be removed.');
                }
            },
        ];
    }
}
