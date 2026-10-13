<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Services\Football\CompetitionSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-standings')]
#[Description('Haal standings op uit de Football API en sla ze op')]
class AddStandings extends Command
{
    use InteractsWithFootballApiConfig;

    public function handle(CompetitionSyncService $sync): int
    {
        if ($this->footballApiConfig() === null) {
            return self::FAILURE;
        }

        return $sync->standings() === 0 ? self::SUCCESS : self::FAILURE;
    }
}
