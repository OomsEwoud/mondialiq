<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class GroupsController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        return to_route('competitions.index');
    }
}
