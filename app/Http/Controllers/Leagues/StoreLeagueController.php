<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\StoreLeagueRequest;
use App\Models\Scoreboard;
use App\Support\Leagues\LeagueBranding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StoreLeagueController extends Controller
{
    public function __invoke(StoreLeagueRequest $request): RedirectResponse
    {
        $league = Scoreboard::query()->create([
            'name' => $request->validated('name'),
            'icon' => LeagueBranding::DEFAULT_ICON,
            'accent_color' => LeagueBranding::DEFAULT_ACCENT_COLOR,
            'cover_style' => LeagueBranding::DEFAULT_COVER_STYLE,
            'code' => $this->generateCode(),
            'owner_id' => $request->user()->id,
        ]);

        $league->users()->attach($request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('League created.'),
        ]);

        return to_route('leagues.show', $league);
    }

    private function generateCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (Scoreboard::query()->where('code', $code)->exists());

        return $code;
    }
}
