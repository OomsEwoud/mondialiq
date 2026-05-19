<?php

namespace App\Console\Commands;

use App\Models\Scoreboard;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:assign-league-owners')]
#[Description('Ken eigenaars toe aan bestaande friends leagues zonder owner')]
class AssignLeagueOwners extends Command
{
    public function handle(): int
    {
        $this->info('League owners toewijzen');

        $ownerAssignments = DB::table('users_has_scoreboards')
            ->orderBy('id')
            ->get(['scoreboard_id', 'user_id'])
            ->unique('scoreboard_id');

        $updatedCount = 0;

        $this->components->task('Eigenaars bepalen en opslaan', function () use ($ownerAssignments, & $updatedCount) {
            foreach ($ownerAssignments as $assignment) {
                $updatedCount += Scoreboard::query()
                    ->whereKey($assignment->scoreboard_id)
                    ->whereNull('owner_id')
                    ->update(['owner_id' => $assignment->user_id]);
            }
        });

        $this->info("{$updatedCount} leagues kregen een owner");

        return self::SUCCESS;
    }
}
