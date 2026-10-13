<?php

namespace App\Console\Commands;

use App\Services\Football\PrematchSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-odds
    {--include-recent : Include fixtures from the last 7 days for development checks}
    {--days=14 : Number of future days to include}')]
#[Description('Haal odds op voor relevante aankomende fixtures en sla ze op')]
class AddOdds extends Command
{
    public function handle(PrematchSyncService $sync): int
    {
        $this->info('Starten met ophalen van fixture odds');
        $result = $sync->sync('odds', max(1, (int) $this->option('days')), (bool) $this->option('include-recent'));
        if ($result['eligible'] === 0) {
            $this->info('Geen fixtures gevonden binnen het odds venster.');

            return self::SUCCESS;
        }
        $this->info("{$result['eligible']} fixtures gevonden binnen het odds venster.");
        $this->info("Due: {$result['due']}; uitgesteld door quota: {$result['deferred']}.");
        $this->reportSummary($result);
        $this->info('Fixture odds sync klaar');

        return $result['failed'] === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function reportSummary(array $summary): void
    {
        $this->info("Odds opgeslagen/bijgewerkt: {$summary['stored']}");
        $this->info("Odds overgeslagen: {$summary['skipped']}");
    }
}
