<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureOddsService;
use Carbon\CarbonInterface;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Throwable;

#[Signature('app:add-odds
    {--include-recent : Include fixtures from the last 7 days for development checks}
    {--days=14 : Number of future days to include}')]
#[Description('Haal odds op voor relevante aankomende fixtures en sla ze op')]
class AddOdds extends Command
{
    private const REQUEST_DELAY_MICROSECONDS = 250000;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureOddsService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starten met ophalen van fixture odds');

        $fixtures = $this->fixturesForOddsSync();

        if ($fixtures->isEmpty()) {
            $this->info('Geen fixtures gevonden binnen het odds venster.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} fixtures gevonden binnen het odds venster.");

        $totals = $this->emptySummary();

        $failed = 0;
        $this->withProgressBar($fixtures, function (Fixture $fixture) use (&$totals, &$failed): void {
            try {
                $totals = $this->mergeSummary($totals, $this->syncFixtureOdds($fixture));
            } catch (Throwable $exception) {
                $failed++;
                $this->newLine();
                $this->error("Fout bij ophalen odds voor fixture {$fixture->id}: {$exception->getMessage()}");
            }
        });

        $this->newLine();
        $this->reportSummary($totals);
        $this->info('Fixture odds sync klaar');

        if ($failed > 0) {
            $this->error("Er zijn odds voor {$failed} fixtures niet gesynchroniseerd vanwege fouten.");
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function oddsWindowStart(): CarbonInterface
    {
        if ($this->option('include-recent')) {
            return now('UTC')->subDays(7);
        }

        return now('UTC');
    }

    private function oddsWindowEnd(): CarbonInterface
    {
        return now('UTC')->addDays(max(1, (int) $this->option('days')));
    }

    /**
     * @return Collection<int, Fixture>
     */
    private function fixturesForOddsSync(): Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->whereBetween('match_date', [$this->oddsWindowStart(), $this->oddsWindowEnd()])
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function syncFixtureOdds(Fixture $fixture): array
    {
        $odds = $this->api->getFixtureOdds((int) $fixture->external_id);
        $summary = $this->service->storeFixtureOdds($odds, $fixture->id);

        usleep(self::REQUEST_DELAY_MICROSECONDS);

        return $summary;
    }

    /**
     * @param  array{stored: int, skipped: int}  $summary
     */
    private function reportSummary(array $summary): void
    {
        $this->info("Odds opgeslagen/bijgewerkt: {$summary['stored']}");
        $this->info("Odds overgeslagen: {$summary['skipped']}");
    }

    /**
     * @return array{stored: int, skipped: int}
     */
    private function emptySummary(): array
    {
        return [
            'stored' => 0,
            'skipped' => 0,
        ];
    }

    /**
     * @param  array{stored: int, skipped: int}  $summary
     * @param  array{stored: int, skipped: int}  $addition
     * @return array{stored: int, skipped: int}
     */
    private function mergeSummary(array $summary, array $addition): array
    {
        $summary['stored'] += $addition['stored'];
        $summary['skipped'] += $addition['skipped'];

        return $summary;
    }
}
