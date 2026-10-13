<?php

namespace App\Console\Commands;

use App\Services\Football\PrematchSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-predictions')]
#[Description('Haal voorspellingen op uit de Football API en sla ze op')]
class AddPredictions extends Command
{
    public function handle(PrematchSyncService $sync): int
    {
        $this->info('Starten met ophalen van voorspellingen');
        $result = $sync->sync('predictions');
        if ($result['eligible'] === 0) {
            $this->info('Geen relevante fixtures gevonden voor voorspellingen sync.');

            return self::SUCCESS;
        }
        $this->info("{$result['eligible']} relevante fixtures gevonden.");
        $this->info("Due: {$result['due']}; uitgesteld door quota: {$result['deferred']}.");
        $this->info('Alle voorspellingen zijn geupdate');

        return $result['failed'] === 0 ? self::SUCCESS : self::FAILURE;
    }
}
