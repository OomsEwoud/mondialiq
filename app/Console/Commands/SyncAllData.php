<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:sync-all-data')]
#[Description('Command description')]
class SyncAllData extends Command
{
    public function handle()
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

        $this->info('Alle data is geupdate');
    }
}
