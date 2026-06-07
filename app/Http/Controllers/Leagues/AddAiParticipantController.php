<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\AddAiParticipantRequest;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class AddAiParticipantController extends Controller
{
    public function __invoke(AddAiParticipantRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $aiUser = User::aiUser();

        if ($aiUser === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('The AI participant is not configured.'),
            ]);

            return to_route('leagues.members', $scoreboard);
        }

        $scoreboard->users()->attach($aiUser->id, [
            'role' => 'ai',
            'joined_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('AI participant added to the prediction group.'),
        ]);

        return to_route('leagues.members', $scoreboard);
    }
}
