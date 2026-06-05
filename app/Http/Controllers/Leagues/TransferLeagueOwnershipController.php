<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\TransferLeagueOwnershipRequest;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransferLeagueOwnershipController extends Controller
{
    public function __invoke(TransferLeagueOwnershipRequest $request, Scoreboard $scoreboard, User $member): RedirectResponse
    {
        DB::transaction(function () use ($request, $scoreboard, $member): void {
            $previousOwnerId = $request->user()->id;

            $scoreboard->update([
                'owner_id' => $member->id,
            ]);

            $scoreboard->users()->updateExistingPivot($previousOwnerId, [
                'role' => 'member',
            ]);
            $scoreboard->users()->updateExistingPivot($member->id, [
                'role' => 'owner',
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Prediction group ownership transferred.'),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
