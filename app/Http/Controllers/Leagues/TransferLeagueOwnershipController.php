<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\TransferLeagueOwnershipRequest;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class TransferLeagueOwnershipController extends Controller
{
    public function __invoke(
        TransferLeagueOwnershipRequest $request,
        Scoreboard $scoreboard,
        User $member,
    ): RedirectResponse {
        $this->authorize('manage', $scoreboard);

        $scoreboard->update([
            'owner_id' => $member->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('League ownership transferred.'),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
