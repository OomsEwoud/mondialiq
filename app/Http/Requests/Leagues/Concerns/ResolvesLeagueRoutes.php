<?php

namespace App\Http\Requests\Leagues\Concerns;

use App\Models\Scoreboard;
use App\Models\User;

trait ResolvesLeagueRoutes
{
    private function league(): Scoreboard
    {
        /** @var Scoreboard $scoreboard */
        $scoreboard = $this->route('scoreboard');

        return $scoreboard;
    }

    private function member(): User
    {
        /** @var User $member */
        $member = $this->route('member');

        return $member;
    }
}
