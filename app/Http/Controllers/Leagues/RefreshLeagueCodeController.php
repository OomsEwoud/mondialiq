<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\RefreshLeagueCodeRequest;
use App\Models\Scoreboard;
use App\Support\Leagues\LeagueCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RefreshLeagueCodeController extends Controller
{
    public function __construct(
        private readonly LeagueCodeGenerator $codeGenerator,
    ) {
    }

    public function __invoke(RefreshLeagueCodeRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $scoreboard->update([
            'code' => $this->codeGenerator->generate(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invite code refreshed.'),
        ]);

        return to_route('leagues.settings', $scoreboard);
    }
}
