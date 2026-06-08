<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-world-cup-data')]
#[Description('Synchroniseer World Cup data en prediction context uit de Football API')]
class SyncWorldCupData extends Command
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
        $this->info('World Cup data sync gestart');

        foreach ($this->commands as $command) {
            $exitCode = $this->call($command['command'], $command['arguments'] ?? []);

            if ($exitCode !== self::SUCCESS) {
                $this->error("World Cup data sync gestopt bij {$command['command']}.");

                return $exitCode;
            }
        }

        $this->info('World Cup data en prediction context zijn geupdate');

        return self::SUCCESS;
    }
}
