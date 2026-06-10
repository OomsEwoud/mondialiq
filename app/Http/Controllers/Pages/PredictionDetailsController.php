<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use App\Models\User;
use App\Services\Prediction\ApiPredictionSummaryService;
use App\Services\Prediction\FixtureOddsSummaryService;
use App\Services\Prediction\UserPredictionScoringService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionDetailsController extends Controller
{
    public function __construct(
        private readonly FixtureOddsSummaryService $oddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
        private readonly UserPredictionScoringService $userPredictionScoringService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request, Fixture $fixture): Response
    {
        $user = $request->user();

        abort_unless($user, 403);
        $this->ensureWorldCupFixture($fixture);

        $this->loadFixture($fixture, $user);
        $mode = $this->predictionMode($request);
        $this->ensurePredictionIsAvailable($fixture, $mode);

        return Inertia::render('prediction-show', [
            'match' => FixtureResource::make($fixture)->resolve(),
            'mode' => $mode,
            'aiContext' => $this->aiContext($fixture),
            'scoringPreview' => $mode === 'mine' ? $this->scoringPreview($fixture) : null,
            'scoringGuideHref' => route('scoring'),
            'owner' => $this->ownerProps($user, true),
            'backHref' => $this->backHref($request, $user),
        ]);
    }

    private function predictionMode(Request $request): string
    {
        return $request->route('predictionMode') === 'ai' ? 'ai' : 'mine';
    }

    private function loadFixture(Fixture $fixture, User $user): void
    {
        $fixture->load([
            'homeTeam',
            'awayTeam',
            'aiPrediction.winner',
            'apiPrediction',
            'userPredictions' => fn ($query) => $query
                ->whereBelongsTo($user)
                ->whereNull('scoreboard_id')
                ->with('winner'),
        ]);
    }

    private function ensurePredictionIsAvailable(Fixture $fixture, string $mode): void
    {
        if ($mode === 'ai') {
            abort_unless($fixture->aiPrediction !== null, 404);

            return;
        }

        abort_unless($fixture->userPredictions->isNotEmpty(), 404);
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

    private function ensureWorldCupFixture(Fixture $fixture): void
    {
        $isWorldCup = in_array($fixture->league_id, $this->worldCupContext->leagueIds(), true)
            && $fixture->season === $this->worldCupContext->season();

        abort_if(! $isWorldCup, 404);
    }

    /**
     * @return array<string, mixed>
     */
    private function ownerProps(User $user, bool $canEdit): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'canEdit' => $canEdit,
        ];
    }

    private function backHref(Request $request, User $user): string
    {
        if ($request->has('back')) {
            return $request->string('back')->toString();
        }

        return route('predictions', ['mode' => $this->predictionMode($request)]);
    }
}
