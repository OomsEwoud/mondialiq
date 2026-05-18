<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardsController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $leaders = User::query()
            ->select(['id', 'name', 'avatar'])
            ->withCount('predictions')
            ->withSum('predictions', 'points')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('name')
            ->get()
            ->values()
            ->map(fn (User $user, int $index) => [
                'id' => $user->id,
                'rank' => $index + 1,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'predictionsCount' => $user->predictions_count,
                'totalPoints' => $user->predictions_sum_points ?? 0,
            ]);

        $currentUserStanding = $leaders->firstWhere('id', $request->user()?->id);

        return Inertia::render('leaderboards', [
            'globalLeaders' => $leaders->take(10)->values(),
            'currentUserStanding' => $currentUserStanding,
            'totalPlayers' => $leaders->count(),
        ]);
    }
}
