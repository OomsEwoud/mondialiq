<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class JoinLeaguePageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('league-join');
    }
}
