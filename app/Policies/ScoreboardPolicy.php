<?php

namespace App\Policies;

use App\Models\Scoreboard;
use App\Models\User;

class ScoreboardPolicy
{
    public function view(User $user, Scoreboard $scoreboard): bool
    {
        return $scoreboard->users()->whereKey($user->id)->exists();
    }

    public function manage(User $user, Scoreboard $scoreboard): bool
    {
        return $scoreboard->owner_id === $user->id;
    }

    public function leave(User $user, Scoreboard $scoreboard): bool
    {
        return $scoreboard->owner_id !== $user->id
            && $scoreboard->users()->whereKey($user->id)->exists();
    }

    public function delete(User $user, Scoreboard $scoreboard): bool
    {
        return $scoreboard->owner_id === $user->id;
    }
}
