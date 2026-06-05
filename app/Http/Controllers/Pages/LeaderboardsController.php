<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Models\User;
use App\Support\Leagues\LeagueBranding;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardsController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $leaders = $this->globalLeaders();
        $user = $request->user();

        return Inertia::render('leaderboards', [
            'globalLeaderboard' => $leaders->take(10)->values(),
            'currentUserPosition' => $this->currentUserPosition($leaders, $user),
            'totalPlayers' => $leaders->count(),
            'joinedLeagues' => $this->joinedLeagues($user),
            'createLeagueHref' => route('leagues.create'),
            'joinLeagueHref' => route('leagues.join'),
            'scoringGuideHref' => route('scoring'),
            'currentLeagueCount' => $this->currentLeagueCount($user),
            'maxLeagueCount' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
        ]);
    }

    private function globalLeaders(): Collection
    {
        return $this->rankedUserQuery()
            ->get()
            ->values()
            ->map(fn (User $user, int $index) => $this->leaderAttributes($user, $index));
    }

    private function rankedUserQuery(): Builder
    {
        return User::query()
            ->select(['id', 'name', 'avatar'])
            ->withCount('predictions')
            ->withSum('predictions', 'points')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('name');
    }

    private function leaderAttributes(User $user, int $index): array
    {
        return [
            'id' => $user->id,
            'rank' => $index + 1,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'predictionsCount' => $user->predictions_count,
            'totalPoints' => $user->predictions_sum_points ?? 0,
        ];
    }

    private function currentUserPosition(Collection $leaders, ?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return $leaders->firstWhere('id', $user->id);
    }

    private function currentLeagueCount(?User $user): int
    {
        return $user?->scoreboards()->count() ?? 0;
    }

    private function joinedLeagues(?User $user): Collection
    {
        if (! $user) {
            return collect();
        }

        return $user->scoreboards()
            ->withCount('users')
            ->get()
            ->map(fn (Scoreboard $scoreboard) => $this->mapJoinedLeague($scoreboard, $user))
            ->values();
    }

    private function mapJoinedLeague(Scoreboard $scoreboard, User $user): array
    {
        $rankings = $this->leagueRankings($scoreboard);
        $currentUserEntry = $rankings->firstWhere('id', $user->id);
        $leader = $rankings->first();

        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'description' => $scoreboard->description,
            'icon' => $scoreboard->icon ?: LeagueBranding::DEFAULT_ICON,
            'memberAvatars' => $this->memberAvatars($scoreboard),
            'accentColor' => $scoreboard->accent_color ?: LeagueBranding::DEFAULT_ACCENT_COLOR,
            'coverStyle' => $scoreboard->cover_style ?: LeagueBranding::DEFAULT_COVER_STYLE,
            'canManage' => $scoreboard->owner_id === $user->id,
            'canLeave' => $scoreboard->owner_id !== $user->id,
            'membersCount' => $scoreboard->users_count,
            'rewardTitle' => $scoreboard->reward_title,
            'rewardDescription' => $scoreboard->reward_description,
            'visibility' => $scoreboard->visibility,
            'isActive' => $scoreboard->is_active,
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

    private function leagueRankings(Scoreboard $scoreboard): Collection
    {
        return $this->rankedLeagueMemberQuery($scoreboard)
            ->get()
            ->values();
    }

    private function rankedLeagueMemberQuery(Scoreboard $scoreboard): BelongsToMany
    {
        return $scoreboard->users()
            ->select(['users.id', 'users.name'])
            ->withSum('predictions', 'points')
            ->withCount('predictions')
            ->withCount([
                'predictions as scoring_predictions_count' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at'),
                'predictions as perfect_predictions_count' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at')
                    ->where('points', 20),
            ])
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name');
    }

    private function memberAvatars(Scoreboard $scoreboard): Collection
    {
        return $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->orderBy('users.name')
            ->limit(3)
            ->get()
            ->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'avatar' => $member->avatarUrl(),
            ])
            ->values();
    }
}
