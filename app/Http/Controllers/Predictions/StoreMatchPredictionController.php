<?php

namespace App\Http\Controllers\Predictions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Predictions\StoreMatchPredictionRequest;
use App\Models\Fixture;
use App\Services\Prediction\UserPredictionService;
use Illuminate\Http\RedirectResponse;

class StoreMatchPredictionController extends Controller
{
    public function __construct(
        private readonly UserPredictionService $userPredictionService,
    ) {
    }

    public function __invoke(StoreMatchPredictionRequest $request, Fixture $fixture): RedirectResponse
    {
        $this->userPredictionService->store($fixture, (int) $request->user()->id, $request->validated());

        return back()->with('success', 'Prediction saved.');
    }
}
