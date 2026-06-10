<?php

namespace App\Actions\League;

use App\Models\Scoreboard;

class UpdateLeagueAction
{
    public function execute(Scoreboard $scoreboard, array $attributes, ?array $scoringRules): Scoreboard
    {
        $scoreboard->update($attributes);

        if ($scoringRules !== null) {
            $scoreboard->update(['scoring_rules' => $scoringRules]);
        }

        return $scoreboard;
    }
}
