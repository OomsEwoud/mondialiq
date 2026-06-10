<?php

namespace App\Services\League;

use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use App\Models\User;
use App\Support\Leagues\LeagueBranding;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

class LeagueShowService
{
    public function members(Scoreboard $scoreboard, User $currentUser): Collection
    {
        $memberIds = $this->memberIds($scoreboard);
        $recentPredictionsByUser = $this->recentPredictionsByUser($memberIds);

        $members = $this->rankedMemberQuery($scoreboard)
            ->get()
            ->values()
            ->map(
                fn (User $user, int $index) => $this->memberAttributes(
                    user: $user,
                    currentUser: $currentUser,
                    scoreboard: $scoreboard,
                    recentPredictions: $recentPredictionsByUser->get($user->id, collect()),
                    index: $index,
                ),
            )
            ->values();

        return $this->withGapsToAbove($members);
    }

    public function leagueAttributes(
        Scoreboard $scoreboard,
        User $user,
        Collection $members,
    ): array {
        $leader = $members->first();
        $currentUser = $members->firstWhere('isCurrentUser', true);
        $lastActivity = $this->lastActivity($members);
        $boostedEnabled = (bool) $scoreboard->scoringRule('boosted_predictions_enabled', false);
        $boostsRemaining = $boostedEnabled
            ? $this->boostsRemaining($scoreboard, $user)
            : null;
        $boostsLimit = $boostedEnabled
            ? (int) $scoreboard->scoringRule('boosted_predictions_limit', 3)
            : null;

        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'description' => $scoreboard->description,
            'icon' => $scoreboard->icon,
            'accentColor' => $scoreboard->accent_color,
            'code' => $scoreboard->code,
            'rewardTitle' => $scoreboard->reward_title,
            'rewardDescription' => $scoreboard->reward_description,
            'visibility' => $scoreboard->visibility,
            'isActive' => $scoreboard->is_active,
            'showHref' => route('leagues.show', $scoreboard),
            'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
            'predictHref' => route('leagues.predict', $scoreboard),
            'settingsHref' => $user->can('manage', $scoreboard)
                ? route('leagues.settings', $scoreboard)
                : null,
            'membersHref' => $user->can('manage', $scoreboard)
                ? route('leagues.members', $scoreboard)
                : null,
            'canManage' => $user->can('manage', $scoreboard),
            'canLeave' => $user->can('leave', $scoreboard),
            'membersCount' => $members->count(),
            'currentLeader' => $leader['name'] ?? null,
            'leaderPoints' => $leader['totalPoints'] ?? 0,
            'currentUserPoints' => $currentUser['totalPoints'] ?? 0,
            'totalPredictions' => $members->sum('predictionsCount'),
            'lastActivityLabel' => $lastActivity?->updated_at instanceof CarbonInterface
                ? $lastActivity->updated_at->diffForHumans()
                : null,
            'members' => $members,
            'currentUserRank' => $currentUser['rank'] ?? null,
            'boostedPredictionsEnabled' => $boostedEnabled,
            'boostsRemaining' => $boostsRemaining,
            'boostsLimit' => $boostsLimit,
        ];
    }

    private function memberIds(Scoreboard $scoreboard): Collection
    {
        return $scoreboard->users()->pluck('users.id');
    }

    private function rankedMemberQuery(Scoreboard $scoreboard): BelongsToMany
    {
        $exactScorePoints = (int) $scoreboard->scoringRule('exact_score_points', 20);

        return $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar', 'users.is_system_user'])
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
            ->withMax('predictions', 'updated_at')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name');
    }

    private function recentPredictionsByUser(Collection $memberIds): Collection
    {
        return Prediction::query()
            ->whereIn('user_id', $memberIds)
            ->whereNotNull('points_awarded_at')
            ->orderByDesc('updated_at')
            ->get(['user_id', 'points', 'updated_at'])
            ->groupBy('user_id')
            ->map(fn (Collection $predictions) => $predictions->take(3)->values());
    }

    private function memberAttributes(
        User $user,
        User $currentUser,
        Scoreboard $scoreboard,
        Collection $recentPredictions,
        int $index,
    ): array {
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
            'isSystemUser' => $user->is_system_user,
            'lastPredictionLabel' => $this->lastPredictionLabel($user),
            'form' => $this->buildFormSummary($recentPredictions, $index === 0),
            'predictionsHref' => route('leagues.member.predictions', ['scoreboard' => $scoreboard, 'user' => $user]),
        ];
    }

    private function withGapsToAbove(Collection $members): Collection
    {
        return $members
            ->map(function (array $member, int $index) use ($members): array {
                $memberAbove = $index > 0 ? $members[$index - 1] : null;

                return [
                    ...$member,
                    'gapToAbove' => $memberAbove
                        ? max(($memberAbove['totalPoints'] ?? 0) - ($member['totalPoints'] ?? 0), 0)
                        : null,
                ];
            })
            ->values();
    }

    private function lastPredictionLabel(User $user): ?string
    {
        if (! filled($user->predictions_max_updated_at)) {
            return null;
        }

        return Carbon::parse($user->predictions_max_updated_at)->diffForHumans();
    }

    private function lastActivity(Collection $members): ?Prediction
    {
        $memberIds = $members->pluck('id');

        if ($memberIds->isEmpty()) {
            return null;
        }

        return Prediction::query()
            ->whereIn('user_id', $memberIds)
            ->latest('updated_at')
            ->first(['updated_at']);
    }

    private function buildFormSummary(Collection $recentPredictions, bool $isLeader = false): array
    {
        if ($recentPredictions->isEmpty()) {
            return [
                'label' => 'No form yet',
                'tone' => 'neutral',
            ];
        }

        $averagePoints = (float) $recentPredictions->avg('points');

        if ($averagePoints >= 20) {
            return [
                'label' => 'Hot streak',
                'tone' => 'hot',
            ];
        }

        if ($averagePoints >= 10) {
            return [
                'label' => 'Steady form',
                'tone' => 'steady',
            ];
        }

        if ($averagePoints > 0) {
            return [
                'label' => $isLeader ? 'Holding the lead' : 'Chasing momentum',
                'tone' => $isLeader ? 'steady' : 'chasing',
            ];
        }

        return [
            'label' => 'Looking for lift',
            'tone' => 'cold',
        ];
    }

    private function boostsRemaining(Scoreboard $scoreboard, User $user): int
    {
        $limit = (int) $scoreboard->scoringRule('boosted_predictions_limit', 3);

        $used = ScoreboardPrediction::query()
            ->where('scoreboard_id', $scoreboard->id)
            ->whereHas('prediction', fn ($q) => $q->where('user_id', $user->id))
            ->where('is_boosted', true)
            ->count();

        return max($limit - $used, 0);
    }

    public function upcomingFixturesQuery(User $user): Builder
    {
        return Fixture::query()
            ->with([
                'homeTeam:id,name,code,logo_url',
                'awayTeam:id,name,code,logo_url',
            ])
            ->with([
                'userPredictions' => fn ($q) => $q
                    ->whereBelongsTo($user)
                    ->select(['id', 'fixture_id', 'user_id', 'winner_id', 'home_goals', 'away_goals', 'confidence', 'points', 'points_awarded_at']),
            ])
            ->upcomingNotStarted()
            ->orderBy('match_date');
    }
}
