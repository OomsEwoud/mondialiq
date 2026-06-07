<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueSettingsController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('manage', $scoreboard);

        $user = $request->user();
        $members = $this->members($scoreboard, $user);

        return Inertia::render('league-settings', [
            'league' => $this->leagueAttributes($scoreboard, $members),
        ]);
    }

    private function rankedMemberQuery(Scoreboard $scoreboard): BelongsToMany
    {
        $exactScorePoints = (int) $scoreboard->scoringRule('exact_score_points', 20);

        return $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->withSum([
                'scoreboardPredictions as predictions_sum_points' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $scoreboard->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at'),
            ], 'scoreboard_predictions.points')
            ->withCount('predictions')
            ->withCount([
                'scoreboardPredictions as scoring_predictions_count' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $scoreboard->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at'),
                'scoreboardPredictions as perfect_predictions_count' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $scoreboard->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at')
                    ->whereRaw('scoreboard_predictions.points >= ?', [$exactScorePoints]),
            ])
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name');
    }

    private function members(Scoreboard $scoreboard, User $currentUser): Collection
    {
        return $this->rankedMemberQuery($scoreboard)
            ->get()
            ->values()
            ->map(fn (User $user, int $index) => $this->memberAttributes(
                user: $user,
                currentUser: $currentUser,
                scoreboard: $scoreboard,
                index: $index,
            ));
    }

    private function memberAttributes(User $user, User $currentUser, Scoreboard $scoreboard, int $index): array
    {
        return [
            'id' => $user->id,
            'rank' => $index + 1,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'predictionsCount' => $user->predictions_count,
            'scoringPredictionsCount' => $user->scoring_predictions_count,
            'perfectPredictionsCount' => $user->perfect_predictions_count,
            'totalPoints' => $user->predictions_sum_points ?? 0,
            'isCurrentUser' => $user->id === $currentUser->id,
            'isOwner' => $user->id === $scoreboard->owner_id,
            'canBeManaged' => $user->id !== $scoreboard->owner_id,
        ];
    }

    private function leagueAttributes(Scoreboard $scoreboard, Collection $members): array
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
            'canManage' => true,
            'membersCount' => $members->count(),
            'members' => $members,
        ];
    }
}
