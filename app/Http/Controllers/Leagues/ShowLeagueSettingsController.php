<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
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
        return $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->withSum([
                'predictions as predictions_sum_points' => fn ($query) => $query
                    ->whereNotNull('points_awarded_at'),
            ], 'points')
            ->withCount('predictions')
            ->withCount([
                'predictions as scoring_predictions_count' => fn ($query) => $query
                    ->whereNotNull('points_awarded_at'),
                'predictions as perfect_predictions_count' => fn ($query) => $query
                    ->whereNotNull('points_awarded_at')
                    ->where('points', 20),
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
            'showHref' => route('leagues.show', $scoreboard),
            'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
            'settingsHref' => route('leagues.settings', $scoreboard),
            'canManage' => true,
            'membersCount' => $members->count(),
            'members' => $members,
        ];
    }
}
