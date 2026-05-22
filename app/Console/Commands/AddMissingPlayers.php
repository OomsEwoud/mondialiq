<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
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

    public function __construct(
        protected FootballApiService $api,
        protected MissingPlayerService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        $this->info('Ophalen van ontbrekende spelers');

        $missingPlayers = [];
        $summary = [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        $this->components->task('Data uit API ophalen', function () use (&$missingPlayers, $config) {
            $missingPlayers = $this->api->getInjuries($config['leagueId'], $config['season']);
        });

        $this->components->task('Data van ontbrekende spelers opslaan in database', function () use (&$summary, $missingPlayers) {
            $summary = $this->service->storeMissingPlayers($missingPlayers);
        });

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
}
