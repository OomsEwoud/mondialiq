<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Support\Collection;
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
            'joinedLeagues' => $this->joinedLeagues($request->user()),
            'createLeagueHref' => route('leagues.create'),
            'joinLeagueHref' => route('leagues.join'),
        ]);
    }

    private function joinedLeagues(?User $user): Collection
    {
        if (! $user) {
            return collect();
        }

        return $user->scoreboards()
            ->withCount('users')
            ->get()
            ->map(fn (Scoreboard $scoreboard) => $this->mapJoinedLeague($scoreboard, $user));
    }

    private function mapJoinedLeague(Scoreboard $scoreboard, User $user): array
    {
        $rankings = $scoreboard->users()
            ->select(['users.id', 'users.name'])
            ->withSum('predictions', 'points')
            ->withCount('predictions')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name')
            ->get()
            ->values();

        $currentUserEntry = $rankings->firstWhere('id', $user->id);
        $leader = $rankings->first();

        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'icon' => $scoreboard->icon,
            'accent_color' => $scoreboard->accent_color,
            'cover_style' => $scoreboard->cover_style,
            'members_count' => $scoreboard->users_count,
            'user_rank' => $currentUserEntry
                ? $rankings->search(fn (User $member) => $member->id === $user->id) + 1
                : null,
            'leader_name' => $leader?->name,
            'points' => $currentUserEntry?->predictions_sum_points ?? 0,
            'predictions_count' => $currentUserEntry?->predictions_count ?? 0,
            'href' => route('leagues.show', $scoreboard),
        ];
    }
}
