<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ShowLeagueController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        abort_unless(
            $scoreboard->users()->whereKey($request->user()->id)->exists(),
            HttpResponse::HTTP_FORBIDDEN,
        );

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
            ]);

        return Inertia::render('league-show', [
            'league' => [
                'id' => $scoreboard->id,
                'name' => $scoreboard->name,
                'code' => $scoreboard->code,
                'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
                'membersCount' => $members->count(),
                'currentLeader' => $members->first()['name'] ?? null,
                'members' => $members,
                'currentUserRank' => $members->firstWhere('isCurrentUser', true)['rank'] ?? null,
            ],
        ]);
    }
}
