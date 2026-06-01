<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use App\Models\User;
use App\Services\Prediction\ApiPredictionSummaryService;
use App\Services\Prediction\FixtureOddsSummaryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionDetailsController extends Controller
{
    public function __construct(
        private readonly FixtureOddsSummaryService $oddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
    ) {
    }

    public function __invoke(Request $request, Fixture $fixture): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        $this->loadFixture($fixture, $user);
        $mode = $this->predictionMode($request);
        $this->ensurePredictionIsAvailable($fixture, $mode);

        return Inertia::render('prediction-show', [
            'match' => FixtureResource::make($fixture)->resolve(),
            'mode' => $mode,
            'aiContext' => $this->aiContext($fixture),
            'scoringGuideHref' => route('scoring'),
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
}
