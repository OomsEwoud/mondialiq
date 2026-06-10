<?php

namespace App\Http\Controllers\Leagues;

use App\Actions\League\CalculateRankingsAction;
use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueMembersController extends Controller
{
    public function __construct(
        private readonly CalculateRankingsAction $calculateRankings
    ) {}

    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('manage', $scoreboard);

        $user = $request->user();
        $members = $this->members($scoreboard, $user);

        return Inertia::render('league-members', [
            'league' => [
                'id' => $scoreboard->id,
                'name' => $scoreboard->name,
                'icon' => $scoreboard->icon,
                'accentColor' => $scoreboard->accent_color,
                'code' => $scoreboard->code,
                'settingsHref' => route('leagues.settings', $scoreboard),
                'showHref' => route('leagues.show', $scoreboard),
                'membersCount' => $members->count(),
            ],
            'members' => $members,
        ]);
    }

    private function members(Scoreboard $scoreboard, User $currentUser): Collection
    {
        $users = $scoreboard->rankedUsers()
            ->get()
            ->values();

        $rankedUsers = $this->calculateRankings->execute($users);

        return $rankedUsers->map(fn (User $user) => $this->memberAttributes(
            user: $user,
            currentUser: $currentUser,
            scoreboard: $scoreboard,
        ));
    }

    private function memberAttributes(User $user, User $currentUser, Scoreboard $scoreboard): array
    {
        return [
            'id' => $user->id,
            'rank' => $user->rank,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'predictionsCount' => $user->predictions_count,
            'scoringPredictionsCount' => $user->scoring_predictions_count,
            'perfectPredictionsCount' => $user->perfect_predictions_count,
            'totalPoints' => $user->predictions_sum_points ?? 0,
            'role' => $user->pivot->role ?? 'member',
            'joinedAt' => filled($user->pivot->joined_at)
                ? Carbon::parse($user->pivot->joined_at)->toIso8601String()
                : null,
            'isCurrentUser' => $user->id === $currentUser->id,
            'isOwner' => $user->id === $scoreboard->owner_id,
            'canBeManaged' => $user->id !== $scoreboard->owner_id,
            'isSystemUser' => $user->is_system_user,
        ];
    }
}
