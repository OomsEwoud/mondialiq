<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use App\Services\Prediction\ApiPredictionSummaryService;
use App\Services\Prediction\FixtureOddsSummaryService;
use Illuminate\Database\Eloquent\Builder;
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

        $fixture->load([
            'homeTeam',
            'awayTeam',
            'aiPrediction.winner',
            'apiPrediction',
            'userPredictions' => fn (Builder $query) => $query
                ->whereBelongsTo($user)
                ->with('winner'),
        ]);

        $mode = $this->predictionMode($request);

        if ($mode === 'ai') {
            abort_unless($fixture->aiPrediction !== null, 404);
        }

        if ($mode === 'mine') {
            abort_unless($fixture->userPredictions->isNotEmpty(), 404);
        }

        return Inertia::render('prediction-show', [
            'match' => FixtureResource::make($fixture)->resolve(),
            'mode' => $mode,
            'aiContext' => [
                'marketOdds' => $this->oddsSummaryService->summarize($fixture),
                'apiPrediction' => $fixture->apiPrediction !== null
                    ? $this->apiPredictionSummaryService->summarize($fixture->apiPrediction)
                    : null,
            ],
        ]);
    }

    private function predictionMode(Request $request): string
    {
        return $request->route('predictionMode') === 'ai' ? 'ai' : 'mine';
    }
}
