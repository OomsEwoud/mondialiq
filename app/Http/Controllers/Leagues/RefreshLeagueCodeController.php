<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RefreshLeagueCodeController extends Controller
{
    public function __invoke(Scoreboard $scoreboard): RedirectResponse
    {
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
