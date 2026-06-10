<?php

namespace App\Services\League;

use App\Actions\League\CalculateRankingsAction;
use App\Models\Scoreboard;
use App\Models\User;
use App\Support\Leagues\LeagueBranding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class LeaderboardService
{
    public function __construct(
        private readonly CalculateRankingsAction $calculateRankings
    ) {}

    public function globalLeaders(): Collection
    {
        $users = $this->rankedUserQuery()
            ->get()
            ->values();

        $rankedUsers = $this->calculateRankings->execute($users);

        return $rankedUsers->map(fn (User $user) => $this->leaderAttributes($user));
    }

    public function currentUserPosition(Collection $leaders, ?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return $leaders->firstWhere('id', $user->id);
    }

    public function currentLeagueCount(?User $user): int
    {
        return $user?->scoreboards()->count() ?? 0;
    }

    public function joinedLeagues(?User $user): Collection
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

    private function rankedUserQuery(): Builder
    {
        return User::query()
            ->select(['id', 'name', 'avatar', 'is_system_user'])
            ->withCount('predictions')
            ->withSum([
                'predictions as predictions_sum_points' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at'),
            ], 'points')
            ->where(function (Builder $query) {
                $query->whereDoesntHave('preference')
                    ->orWhereHas('preference', function (Builder $query) {
                        $query->where('show_on_leaderboards', true);
                    });
            })
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('name');
    }

    private function leaderAttributes(User $user): array
    {
        return [
            'id' => $user->id,
            'rank' => $user->rank,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'predictionsCount' => $user->predictions_count,
            'totalPoints' => $user->predictions_sum_points ?? 0,
            'isSystemUser' => $user->is_system_user,
            'showOnLeaderboards' => $user->preference?->show_on_leaderboards ?? true,
            'predictionsArePublic' => $user->predictionsArePublic(),
            'publicPredictionsHref' => $this->publicPredictionsHref($user),
        ];
    }

    private function publicPredictionsHref(User $user): ?string
    {
        if ($user->is_system_user) {
            return route('ai.predictions');
        }

        if (! $user->predictionsArePublic()) {
            return null;
        }

        return route('users.predictions', $user);
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
            'code' => $scoreboard->code,
            'canManage' => $scoreboard->owner_id === $user->id,
            'canLeave' => $scoreboard->owner_id !== $user->id,
            'membersCount' => $scoreboard->users_count,
            'rewardTitle' => $scoreboard->reward_title,
            'rewardDescription' => $scoreboard->reward_description,
            'visibility' => $scoreboard->visibility,
            'isActive' => $scoreboard->is_active,
            'userRank' => $currentUserEntry?->rank,
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
        $users = $scoreboard->rankedUsers()
            ->get()
            ->values();

        return $this->calculateRankings->execute($users);
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
