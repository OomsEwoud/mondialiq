<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rankings\AiRankingsRequest;
use App\Services\Prediction\AiRankingService;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardsController extends Controller
{
    public function __construct(
        private readonly AiRankingService $rankingService,
    ) {}

    public function __invoke(AiRankingsRequest $request): Response
    {
        return Inertia::render('leaderboards', $this->rankingService->overview([
            'competition' => $request->filled('competition') ? $request->integer('competition') : null,
            'team' => $request->filled('team') ? $request->integer('team') : null,
            'period' => $request->validated('period') ?? '30d',
            'predictionType' => $request->validated('predictionType') ?? 'all',
            'confidence' => $request->validated('confidence') ?? 'all',
        ]));
    }
}
