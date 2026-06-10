<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use App\Models\User;
use App\Services\Prediction\ApiPredictionSummaryService;
use App\Services\Prediction\FixtureOddsSummaryService;
use App\Services\Prediction\UserPredictionScoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowUserPredictionController extends Controller
{
    public function __construct(
        private readonly FixtureOddsSummaryService $oddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
        private readonly UserPredictionScoringService $userPredictionScoringService,
    ) {}

    public function __invoke(Request $request, Fixture $fixture, User $user): Response
    {
        $viewer = $request->user();

        if ($viewer?->id !== $user->id) {
            abort_unless($user->allowsPublicPredictionViewing(), 403);
        }

        $this->loadFixture($fixture, $user, $viewer);

        abort_unless($fixture->userPredictions->isNotEmpty(), 404);

        return Inertia::render('prediction-show', [
            'match' => FixtureResource::make($fixture)->resolve(),
            'mode' => 'mine',
            'aiContext' => $this->aiContext($fixture),
            'scoringPreview' => $this->scoringPreview($fixture),
            'scoringGuideHref' => route('scoring'),
            'owner' => $this->ownerProps($user, $viewer?->id === $user->id),
            'backHref' => route('users.predictions', $user),
        ]);
    }

    private function loadFixture(Fixture $fixture, User $user, ?User $viewer): void
    {
        $fixture->load([
            'homeTeam',
            'awayTeam',
            'apiPrediction',
            'userPredictions' => function ($query) use ($user, $viewer) {
                $query->where('user_id', $user->id)
                    ->where('source', 'user')
                    ->whereNull('scoreboard_id')
                    ->visibleFor($viewer)
                    ->with('winner');
            },
        ]);
    }

    private function aiContext(Fixture $fixture): array
    {
        return [
            'marketOdds' => $this->oddsSummaryService->summarize($fixture),
            'apiPrediction' => $fixture->apiPrediction !== null
                ? $this->apiPredictionSummaryService->summarize($fixture->apiPrediction)
                : null,
        ];
    }

    private function scoringPreview(Fixture $fixture): ?array
    {
        $prediction = $fixture->userPredictions->first();

        if (! $prediction) {
            return null;
        }

        $breakdown = $this->userPredictionScoringService->previewBreakdown($fixture, $prediction);

        if ($breakdown === null) {
            return null;
        }

        return [
            'points' => $breakdown['total'],
            'maxPoints' => $this->userPredictionScoringService->maxPoints(),
            'breakdown' => $breakdown,
            'helper' => 'Based on the current score. Official points are only awarded after validation.',
        ];
    }

    private function ownerProps(User $user, bool $canEdit): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'canEdit' => $canEdit,
        ];
    }
}
