<?php

namespace App\Exceptions\League;

use App\Models\Scoreboard;
use App\Support\Leagues\LeagueMembershipLimit;
use Exception;

class CannotJoinLeagueException extends Exception
{
    public static function inactive(): self
    {
        return new self('This prediction group is not accepting new members.');
    }

    public static function alreadyMember(Scoreboard $scoreboard): self
    {
        return new self(__('You are already a member of :group.', ['group' => $scoreboard->name]));
    }

    public static function limitReached(): self
    {
        return new self(__('You can only join up to :max prediction groups.', ['max' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER]));
    }
}
