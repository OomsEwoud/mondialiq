<?php

namespace App\Http\Controllers\RenderControllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MatchesController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('matches');
    }
}
