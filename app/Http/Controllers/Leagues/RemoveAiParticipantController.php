<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\RemoveAiParticipantRequest;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RemoveAiParticipantController extends Controller
{
    public function __invoke(RemoveAiParticipantRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $aiUser = User::aiUser();

        if ($aiUser === null) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('The AI participant is not configured.'),
            ]);

            return to_route('leagues.members', $scoreboard);
        }

        $scoreboard->users()->detach($aiUser->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('AI participant removed from the prediction group.'),
        ]);

        return to_route('leagues.members', $scoreboard);
    }
}
