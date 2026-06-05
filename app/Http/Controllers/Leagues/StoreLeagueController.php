<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\StoreLeagueRequest;
use App\Models\Scoreboard;
use App\Support\Leagues\LeagueBranding;
use App\Support\Leagues\LeagueCodeGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StoreLeagueController extends Controller
{
    public function __construct(
        private readonly LeagueCodeGenerator $codeGenerator,
    ) {
    }

    public function __invoke(StoreLeagueRequest $request): RedirectResponse
    {
        $league = DB::transaction(function () use ($request): Scoreboard {
            $data = $request->validated();

            $league = Scoreboard::query()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'icon' => LeagueBranding::DEFAULT_ICON,
                'accent_color' => LeagueBranding::DEFAULT_ACCENT_COLOR,
                'cover_style' => LeagueBranding::DEFAULT_COVER_STYLE,
                'code' => $this->codeGenerator->generate(),
                'owner_id' => $request->user()->id,
                'reward_title' => $data['reward_title'] ?? null,
                'reward_description' => $data['reward_description'] ?? null,
                'visibility' => $data['visibility'] ?? 'private',
                'is_active' => $request->boolean('is_active', true),
            ]);

            $league->users()->attach($request->user()->id, [
                'role' => 'owner',
                'joined_at' => now(),
            ]);

            return $league;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Prediction group created.'),
        ]);

        return to_route('leagues.show', $league);
    }
}
