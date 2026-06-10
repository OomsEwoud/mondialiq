<?php

namespace App\Services\League;

use App\Actions\League\CalculateRankingsAction;
use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class LeagueShowService
{
    public function __construct(
        private readonly CalculateRankingsAction $calculateRankings
    ) {}

    public function members(Scoreboard $scoreboard, User $currentUser): Collection
    {
        $memberIds = $this->memberIds($scoreboard);
        $recentPredictionsByUser = $this->recentPredictionsByUser($memberIds);

        $users = $scoreboard->rankedUsers()
            ->get()
            ->values();

        $rankedUsers = $this->calculateRankings->execute($users);

        $previousTotalPoints = null;

        return $rankedUsers->map(function (User $user) use ($currentUser, $scoreboard, $recentPredictionsByUser, &$previousTotalPoints) {
            $member = $this->memberAttributes(
                user: $user,
                currentUser: $currentUser,
                scoreboard: $scoreboard,
                recentPredictions: $recentPredictionsByUser->get($user->id, collect()),
            );

            $member['gapToAbove'] = $previousTotalPoints !== null
                ? max($previousTotalPoints - ($member['totalPoints'] ?? 0), 0)
                : null;

            $previousTotalPoints = $member['totalPoints'] ?? 0;

            return $member;
        });
    }

    public function leagueAttributes(
        Scoreboard $scoreboard,
        User $user,
        Collection $members,
    ): array {
        $leader = $members->first();
        $currentUser = $members->firstWhere('isCurrentUser', true);
        $lastActivity = $this->lastActivity($members);
        $boostedEnabled = $scoreboard->boostedPredictionsEnabled();
        $boostsRemaining = $scoreboard->remainingBoostsFor($user);
        $boostsUsed = $scoreboard->usedBoostsFor($user);
        $boostsLimit = $scoreboard->boostedPredictionsLimit();
        $boostedConfidenceThreshold = $scoreboard->boostedConfidenceThreshold();

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
            'boostedConfidenceThreshold' => $boostedConfidenceThreshold,
        ];
    }

    private function memberIds(Scoreboard $scoreboard): Collection
    {
        return $scoreboard->users()->pluck('users.id');
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
    ): array {
        return [
            'id' => $user->id,
            'rank' => $user->rank,
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
            'form' => $this->buildFormSummary($recentPredictions, $user->rank === 1),
            'predictionsHref' => route('leagues.member.predictions', ['scoreboard' => $scoreboard, 'user' => $user]),
        ];
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
