<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class JoinLeaguePageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('league-join', [
            'initialCode' => Str::upper(Str::substr((string) $request->query('code', ''), 0, 8)),
        ]);
    }
}
