<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('view', $scoreboard);

        $memberIds = $scoreboard->users()->pluck('users.id');

        $members = $scoreboard->users()
            ->select(['users.id', 'users.name', 'users.avatar'])
            ->withSum('predictions', 'points')
            ->withCount('predictions')
            ->withCount([
                'predictions as scoring_predictions_count' => fn (Builder $query) => $query
                    ->where('points', '>', 0),
            ])
            ->withMax('predictions', 'updated_at')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name')
            ->get()
            ->values();

        $recentPredictionsByUser = Prediction::query()
            ->whereIn('user_id', $memberIds)
            ->orderByDesc('updated_at')
            ->get(['user_id', 'points', 'updated_at'])
            ->groupBy('user_id')
            ->map(fn (Collection $predictions) => $predictions->take(3)->values());

        $members = $members
            ->map(fn (User $user, int $index) => [
                'id' => $user->id,
                'rank' => $index + 1,
                'name' => $user->name,
                'avatar' => $user->avatarUrl(),
                'predictionsCount' => $user->predictions_count,
                'scoringPredictionsCount' => $user->scoring_predictions_count,
                'totalPoints' => $user->predictions_sum_points ?? 0,
                'isCurrentUser' => $user->id === $request->user()->id,
                'isOwner' => $user->id === $scoreboard->owner_id,
                'canBeManaged' => $user->id !== $scoreboard->owner_id,
                'lastPredictionLabel' => filled($user->predictions_max_updated_at)
                    ? Carbon::parse($user->predictions_max_updated_at)->diffForHumans()
                    : null,
                'form' => $this->buildFormSummary(
                    $recentPredictionsByUser->get($user->id, collect())
                ),
            ])
            ->values();

        $members = $members
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

        $leader = $members->first();
        $currentUser = $members->firstWhere('isCurrentUser', true);
        $lastActivity = Prediction::query()
            ->whereIn('user_id', $memberIds)
            ->latest('updated_at')
            ->first(['updated_at']);

        return Inertia::render('league-show', [
            'league' => [
                'id' => $scoreboard->id,
                'name' => $scoreboard->name,
                'icon' => $scoreboard->icon,
                'accentColor' => $scoreboard->accent_color,
                'coverStyle' => $scoreboard->cover_style,
                'code' => $scoreboard->code,
                'showHref' => route('leagues.show', $scoreboard),
                'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
                'settingsHref' => $request->user()->can('manage', $scoreboard)
                    ? route('leagues.settings', $scoreboard)
                    : null,
                'canManage' => $request->user()->can('manage', $scoreboard),
                'canLeave' => $request->user()->can('leave', $scoreboard),
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
            ],
        ]);
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
