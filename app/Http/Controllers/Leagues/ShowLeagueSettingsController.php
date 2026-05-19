<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueSettingsController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('manage', $scoreboard);

        $members = $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->withSum('predictions', 'points')
            ->withCount('predictions')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name')
            ->get()
            ->values()
            ->map(fn (User $user, int $index) => [
                'id' => $user->id,
                'rank' => $index + 1,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'predictionsCount' => $user->predictions_count,
                'totalPoints' => $user->predictions_sum_points ?? 0,
                'isCurrentUser' => $user->id === $request->user()->id,
                'isOwner' => $user->id === $scoreboard->owner_id,
                'canBeManaged' => $user->id !== $scoreboard->owner_id,
            ]);

        return Inertia::render('league-settings', [
            'league' => [
                'id' => $scoreboard->id,
                'name' => $scoreboard->name,
                'code' => $scoreboard->code,
                'showHref' => route('leagues.show', $scoreboard),
                'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
                'settingsHref' => route('leagues.settings', $scoreboard),
                'canManage' => true,
                'membersCount' => $members->count(),
                'members' => $members,
            ],
        ]);
    }
}
