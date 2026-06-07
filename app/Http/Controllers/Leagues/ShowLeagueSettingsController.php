<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueSettingsController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('manage', $scoreboard);

        return Inertia::render('league-settings', [
            'league' => $this->leagueAttributes($scoreboard),
        ]);
    }

    private function leagueAttributes(Scoreboard $scoreboard): array
    {
        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'description' => $scoreboard->description,
            'icon' => $scoreboard->icon,
            'accentColor' => $scoreboard->accent_color,
            'coverStyle' => $scoreboard->cover_style,
            'code' => $scoreboard->code,
            'rewardTitle' => $scoreboard->reward_title,
            'rewardDescription' => $scoreboard->reward_description,
            'visibility' => $scoreboard->visibility,
            'isActive' => $scoreboard->is_active,
            'scoringRules' => $scoreboard->scoring_rules ?? [
                'exact_score_points' => 10,
                'correct_result_points' => 5,
                'correct_goal_difference_points' => 3,
                'correct_home_goals_points' => 1,
                'correct_away_goals_points' => 1,
                'boosted_predictions_enabled' => false,
                'boosted_predictions_limit' => 3,
                'boosted_confidence_threshold' => 70,
                'boosted_prediction_bonus_points' => 2,
            ],
            'showHref' => route('leagues.show', $scoreboard),
            'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
            'settingsHref' => route('leagues.settings', $scoreboard),
            'membersHref' => route('leagues.members', $scoreboard),
            'canManage' => true,
            'membersCount' => $scoreboard->users()->count(),
        ];
    }
}
