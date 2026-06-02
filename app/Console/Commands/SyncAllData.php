<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-all-data')]
#[Description('Synchroniseer alle basisdata uit de Football API')]
class SyncAllData extends Command
{
    /**
     * @var array<int, string>
     */
    private array $commands = [
        'app:add-countries',
        'app:add-leagues',
        'app:add-teams',
        'app:add-fixtures',
        'app:add-players',
        'app:add-standings',
        'app:add-bookmakers',
        'app:add-predictions',
        'app:add-coaches',
        'app:add-venues',
        'app:add-missing-players',
        'app:import-head-to-head',
        'app:import-team-statistics',
        'app:add-fixture-data',
        'app:add-fixture-player-stats',
    ];

    public function handle(): int
    {
        $this->info('Bezig met ophalen van alle data');

        foreach ($this->commands as $command) {
            $exitCode = $this->call($command);

            if ($exitCode !== self::SUCCESS) {
                $this->error("Data sync gestopt bij {$command}.");

                return $exitCode;
            }
        }

        $this->info('Alle data is geupdate');

        return self::SUCCESS;
    }
}
