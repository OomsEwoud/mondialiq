<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HowItWorksController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('how-it-works');
    }
}
