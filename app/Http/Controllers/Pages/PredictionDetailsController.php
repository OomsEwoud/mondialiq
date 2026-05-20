<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionDetailsController extends Controller
{
    public function __invoke(Request $request, Fixture $fixture): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        $fixture->load([
            'homeTeam',
            'awayTeam',
            'userPredictions' => fn ($query) => $query
                ->whereBelongsTo($user)
                ->with('winner'),
        ]);

        abort_unless($fixture->userPredictions->isNotEmpty(), 404);

        return Inertia::render('prediction-show', [
            'match' => FixtureResource::make($fixture)->resolve(),
        ]);
    }
}
