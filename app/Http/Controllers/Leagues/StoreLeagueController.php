<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\StoreLeagueRequest;
use App\Models\Scoreboard;
use App\Support\Leagues\LeagueBranding;
use App\Support\Leagues\LeagueCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class StoreLeagueController extends Controller
{
    public function __construct(
        private readonly LeagueCodeGenerator $codeGenerator,
    ) {
    }

    public function __invoke(StoreLeagueRequest $request): RedirectResponse
    {
        $league = Scoreboard::query()->create([
            'name' => $request->validated('name'),
            'icon' => LeagueBranding::DEFAULT_ICON,
            'accent_color' => LeagueBranding::DEFAULT_ACCENT_COLOR,
            'cover_style' => LeagueBranding::DEFAULT_COVER_STYLE,
            'code' => $this->codeGenerator->generate(),
            'owner_id' => $request->user()->id,
        ]);

        $league->users()->attach($request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('League created.'),
        ]);

        return to_route('leagues.show', $league);
    }
}
