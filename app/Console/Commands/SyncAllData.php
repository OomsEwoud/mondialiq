<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-all-data')]
#[Description('Synchroniseer alle basisdata uit de Football API')]
class SyncAllData extends Command
{
    public function handle(): int
    {
        $this->info('Bezig met ophalen van alle data');

        $this->call('app:add-countries');
        $this->call('app:add-leagues');
        $this->call('app:add-teams');
        $this->call('app:add-players');
        $this->call('app:add-fixtures');
        $this->call('app:add-standings');
        $this->call('app:add-bookmakers');
        $this->call('app:add-predictions');
        $this->call('app:add-coaches');
        $this->call('app:add-venues');
        $this->call('app:add-fixture-data');
        $this->call('app:add-fixture-player-stats');

        $this->info('Alle data is geupdate');

        return self::SUCCESS;
    }
}
