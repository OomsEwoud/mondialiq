<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\MissingPlayerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-missing-players')]
#[Description('Haal ontbrekende en questionable spelers op uit de Football API en sla ze op')]
class AddMissingPlayers extends Command
{
    use InteractsWithFootballApiConfig;
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly MissingPlayerService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        $summary = $this->emptySummary();

        $this->runFootballApiImport(
            'Ophalen van ontbrekende spelers',
            'Data van ontbrekende spelers opslaan in database',
            fn (): array => $this->api->getInjuries($config['leagueId'], $config['season']),
            function (array $missingPlayers) use (&$summary): void {
                $summary = $this->service->storeMissingPlayers($missingPlayers);
            },
            'Ontbrekende spelers sync klaar',
            storeWhenEmpty: true,
        );

        if ($summary['processed'] === 0) {
            $this->info('Geen ontbrekende spelers ontvangen van de API.');

            return self::SUCCESS;
        }

        $this->info("Ontbrekende spelers verwerkt: {$summary['processed']}");
        $this->info("Nieuwe records: {$summary['created']}");
        $this->info("Bijgewerkte records: {$summary['updated']}");
        $this->info("Overgeslagen records: {$summary['skipped']}");

        return self::SUCCESS;
    }

    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    private function emptySummary(): array
    {
        return [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];
    }
}
