<?php

namespace App\Http\Requests\Leagues;

use App\Http\Requests\Leagues\Concerns\ResolvesLeagueRoutes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class RemoveLeagueMemberRequest extends FormRequest
{
    use ResolvesLeagueRoutes;

    public function authorize(): bool
    {
        return $this->user()?->can('manage', $this->league()) ?? false;
    }

    public function rules(): array
    {
        return [];
    }

    public function after(): array
    {
        return [$this->validateMemberRemoval(...)];
    }

    private function validateMemberRemoval(Validator $validator): void
    {
        $scoreboard = $this->league();
        $member = $this->member();

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
    }
}
