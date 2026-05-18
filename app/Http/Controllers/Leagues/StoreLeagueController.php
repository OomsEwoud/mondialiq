<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\StoreLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class StoreLeagueController extends Controller
{
    public function __invoke(StoreLeagueRequest $request): RedirectResponse
    {
        $league = Scoreboard::query()->create([
            'name' => $request->validated('name'),
            'code' => $this->generateCode(),
        ]);

        $league->users()->attach($request->user()->id);

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
