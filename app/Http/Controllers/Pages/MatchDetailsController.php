<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchDetailsResource;
use App\Models\Fixture;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchDetailsController extends Controller
{
    public function __invoke(Fixture $fixture, Request $request): Response
    {
        $fixture->loadMatchDetails($request->user());

        return Inertia::render('match-details', [
            'match' => MatchDetailsResource::make($fixture)->resolve(),
        ]);
    }
}
