<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('view', $scoreboard);
        
        $user = $request->user();
        $memberIds = $this->memberIds($scoreboard);
        $members = $this->members($scoreboard, $user, $memberIds);

        return Inertia::render('league-show', [
            'league' => $this->leagueAttributes($scoreboard, $user, $members, $memberIds),
        ]);
    }

    private function memberIds(Scoreboard $scoreboard): Collection
    {
        return $scoreboard->users()->pluck('users.id');
    }

    private function members(Scoreboard $scoreboard, User $currentUser, Collection $memberIds): Collection
    {
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

    private function rankedMemberQuery(Scoreboard $scoreboard): BelongsToMany
    {
        return $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->withSum([
                'predictions as predictions_sum_points' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at'),
            ], 'points')
            ->withCount('predictions')
            ->withCount([
                'predictions as scoring_predictions_count' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at'),
                'predictions as perfect_predictions_count' => fn (Builder $query) => $query
                    ->whereNotNull('points_awarded_at')
                    ->where('points', 20),
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
            'lastPredictionLabel' => $this->lastPredictionLabel($user),
            'form' => $this->buildFormSummary($recentPredictions),
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

    private function leagueAttributes(
        Scoreboard $scoreboard,
        User $user,
        Collection $members,
        Collection $memberIds,
    ): array {
        $leader = $members->first();
        $currentUser = $members->firstWhere('isCurrentUser', true);
        $lastActivity = $this->lastActivity($memberIds);

        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'description' => $scoreboard->description,
            'icon' => $scoreboard->icon,
            'accentColor' => $scoreboard->accent_color,
            'coverStyle' => $scoreboard->cover_style,
            'code' => $scoreboard->code,
            'rewardTitle' => $scoreboard->reward_title,
            'rewardDescription' => $scoreboard->reward_description,
            'visibility' => $scoreboard->visibility,
            'isActive' => $scoreboard->is_active,
            'showHref' => route('leagues.show', $scoreboard),
            'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
            'settingsHref' => $user->can('manage', $scoreboard)
                ? route('leagues.settings', $scoreboard)
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
        ];
    }

    private function lastActivity(Collection $memberIds): ?Prediction
    {
        return Prediction::query()
            ->whereIn('user_id', $memberIds)
            ->latest('updated_at')
            ->first(['updated_at']);
    }

    private function buildFormSummary(Collection $recentPredictions): array
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
                'label' => 'Chasing momentum',
                'tone' => 'chasing',
            ];
        }

        return [
            'label' => 'Looking for lift',
            'tone' => 'cold',
        ];
    }
}
