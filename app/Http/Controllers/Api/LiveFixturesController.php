<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Fixture\LiveFixtureService;
use Illuminate\Http\JsonResponse;

class LiveFixturesController extends Controller
{
    public function __invoke(LiveFixtureService $liveFixtureService): JsonResponse
    {
        return response()->json([
            'data' => $liveFixtureService->liveFixtures(),
        ]);
    }
}
