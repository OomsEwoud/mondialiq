<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureOddsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:add-odds
    {--include-recent : Include fixtures from the last 7 days for development checks}
    {--days=14 : Number of future days to include}')]
#[Description('Haal odds op voor relevante aankomende fixtures en sla ze op')]
class AddOdds extends Command
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureOddsService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starten met ophalen van fixture odds');

        $windowStart = $this->option('include-recent')
            ? now('UTC')->subDays(7)
            : now('UTC');
        $windowEnd = now('UTC')->addDays(max(1, (int) $this->option('days')));

        $fixtures = Fixture::query()
            ->whereNotNull('external_id')
            ->whereBetween('match_date', [$windowStart, $windowEnd])
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);

        if ($fixtures->isEmpty()) {
            $this->info('Geen fixtures gevonden binnen het odds venster.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} fixtures gevonden binnen het odds venster.");

        $totals = [
            'stored' => 0,
            'skipped' => 0,
        ];

        $this->withProgressBar($fixtures, function (Fixture $fixture) use (&$totals) {
            try {
                $odds = $this->api->getFixtureOdds($fixture->external_id);
                $summary = $this->service->storeFixtureOdds($odds, $fixture->id);

                $totals['stored'] += $summary['stored'];
                $totals['skipped'] += $summary['skipped'];

                usleep(250000);
            } catch (Throwable $e) {
                $this->newLine();
                $this->error("Fout bij ophalen odds voor fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info("Odds opgeslagen/bijgewerkt: {$totals['stored']}");
        $this->info("Odds overgeslagen: {$totals['skipped']}");
        $this->info('Fixture odds sync klaar');

        return self::SUCCESS;
    }
}
