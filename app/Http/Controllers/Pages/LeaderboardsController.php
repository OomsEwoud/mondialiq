<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use App\Support\Leagues\LeagueBranding;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $currentLeagueCount = $request->user()?->scoreboards()->count() ?? 0;

        return Inertia::render('leaderboards', [
            'globalLeaderboard' => $leaders->take(10)->values(),
            'currentUserPosition' => $currentUserStanding,
            'totalPlayers' => $leaders->count(),
            'joinedLeagues' => $this->joinedLeagues($request->user()),
            'createLeagueHref' => route('leagues.create'),
            'joinLeagueHref' => route('leagues.join'),
            'currentLeagueCount' => $currentLeagueCount,
            'maxLeagueCount' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
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
            'icon' => $scoreboard->icon ?: LeagueBranding::DEFAULT_ICON,
            'accentColor' => $scoreboard->accent_color ?: LeagueBranding::DEFAULT_ACCENT_COLOR,
            'coverStyle' => $scoreboard->cover_style ?: LeagueBranding::DEFAULT_COVER_STYLE,
            'canManage' => $scoreboard->owner_id === $user->id,
            'canLeave' => $scoreboard->owner_id !== $user->id,
            'membersCount' => $scoreboard->users_count,
            'userRank' => $currentUserEntry
                ? $rankings->search(fn (User $member) => $member->id === $user->id) + 1
                : null,
            'leaderName' => $leader?->name,
            'points' => $currentUserEntry?->predictions_sum_points ?? 0,
            'predictionsCount' => $currentUserEntry?->predictions_count ?? 0,
            'href' => route('leagues.show', $scoreboard),
            'settingsHref' => $scoreboard->owner_id === $user->id
                ? route('leagues.settings', $scoreboard)
                : null,
        ];
    }
}
