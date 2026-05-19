<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\RefreshLeagueCodeRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RefreshLeagueCodeController extends Controller
{
    public function __invoke(RefreshLeagueCodeRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $this->authorize('manage', $scoreboard);

        $scoreboard->update([
            'code' => $this->generateCode(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Invite code refreshed.'),
        ]);

        return to_route('leagues.show', $scoreboard);
    }

    private function generateCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (Scoreboard::query()->where('code', $code)->exists());

        return $code;
    }
}
