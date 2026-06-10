<?php

namespace App\Actions\League;

use App\Exceptions\League\CannotJoinLeagueException;
use App\Models\Scoreboard;
use App\Models\User;
use App\Support\Leagues\LeagueMembershipLimit;

class JoinLeagueAction
{
    public function execute(Scoreboard $scoreboard, User $user): void
    {
        if (! $scoreboard->is_active) {
            throw CannotJoinLeagueException::inactive();
        }

        if ($scoreboard->users()->where('user_id', $user->id)->exists()) {
            throw CannotJoinLeagueException::alreadyMember($scoreboard);
        }

        if ($user->scoreboards()->count() >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER) {
            throw CannotJoinLeagueException::limitReached();
        }

        $scoreboard->users()->attach($user->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);
    }
}
