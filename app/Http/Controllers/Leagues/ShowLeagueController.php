<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\User;
use Carbon\CarbonInterface;
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

        $memberIds = $scoreboard->users()->pluck('users.id');

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
                'code' => $scoreboard->code,
                'joinHref' => route('leagues.join', ['code' => $scoreboard->code]),
                'membersCount' => $members->count(),
                'currentLeader' => $leader['name'] ?? null,
                'leaderPoints' => $leader['totalPoints'] ?? 0,
                'currentUserPoints' => $currentUser['totalPoints'] ?? 0,
                'totalPredictions' => $members->sum('predictionsCount'),
                'lastActivityLabel' => $lastActivity?->updated_at instanceof CarbonInterface
                    ? $lastActivity->updated_at->diffForHumans()
                    : null,
                'gapToLeader' => $this->buildGapToLeader($leader, $currentUser),
                'members' => $members,
                'currentUserRank' => $currentUser['rank'] ?? null,
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $leader
     * @param  array<string, mixed>|null  $currentUser
     * @return array{points:int, summary:string}
     */
    private function buildGapToLeader(?array $leader, ?array $currentUser): array
    {
        if (! $leader || ! $currentUser) {
            return [
                'points' => 0,
                'summary' => 'No standings data yet.',
            ];
        }

        $gap = max(($leader['totalPoints'] ?? 0) - ($currentUser['totalPoints'] ?? 0), 0);

        if (($currentUser['rank'] ?? null) === 1) {
            return [
                'points' => 0,
                'summary' => 'You are leading this league right now.',
            ];
        }

        return [
            'points' => $gap,
            'summary' => "You are {$gap} pts behind {$leader['name']}.",
        ];
    }
}
