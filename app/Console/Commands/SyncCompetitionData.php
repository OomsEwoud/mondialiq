<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-competition-data')]
#[Description('Synchroniseer competitiegegevens en prediction context uit de Football API')]
class SyncCompetitionData extends Command
{
    private array $commands = [
        ['command' => 'app:add-countries'],
        ['command' => 'app:add-leagues'],
        ['command' => 'app:add-teams'],
        ['command' => 'app:add-fixtures'],

        ['command' => 'app:add-players'],
        ['command' => 'app:add-coaches'],
        ['command' => 'app:add-venues'],

        ['command' => 'app:add-standings'],
        ['command' => 'app:add-bookmakers'],
        ['command' => 'app:add-odds', 'arguments' => ['--days' => 90]],
        ['command' => 'app:add-predictions'],

        ['command' => 'app:import-head-to-head', 'arguments' => ['--force' => true]],
        ['command' => 'app:import-team-statistics', 'arguments' => ['--force' => true]],
        ['command' => 'app:add-fixture-lineups'],
        ['command' => 'app:add-fixture-data'],
        ['command' => 'app:add-fixture-player-stats'],
    ];

    public function handle(): int
    {
        $this->info('Competitiedata synchronisatie gestart');

        foreach ($this->commands as $command) {
            $exitCode = $this->call($command['command'], $command['arguments'] ?? []);

            if ($exitCode !== self::SUCCESS) {
                $this->error("Synchronisatie gestopt bij {$command['command']}.");

                return $exitCode;
            }
        }

        $this->info('Competitiedata en prediction context zijn bijgewerkt');

        return self::SUCCESS;
    }
}
