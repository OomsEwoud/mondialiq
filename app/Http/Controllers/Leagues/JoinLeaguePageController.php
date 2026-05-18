<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JoinLeaguePageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('league-join', [
            'initialCode' => strtoupper((string) $request->string('code')->limit(8)),
        ]);
    }
}
