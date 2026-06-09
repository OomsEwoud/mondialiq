<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use App\Services\Player\PlayerStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-players')]
#[Description('Sync all players and team squads from the Football API')]
class AddPlayers extends Command
{
    use InteractsWithFootballApiConfig;
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly PlayerService $service,
        private readonly PlayerStatsService $statsService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        return $this->runFootballApiImport(
            'Ophalen van players',
            'Data van players opslaan in database',
            fn (): array => $this->api->getPlayersByLeagueSeason($config['leagueId'], $config['season']),
            function (array $players) use ($config): void {
                $this->storePlayers($players, $config['leagueId'], $config['season']);
            },
            'Players klaar',
            storeWhenEmpty: true,
        );
    }

    private function storePlayers(array $players, int $leagueId, int $season): void
    {
        if (! empty($players)) {
            $this->service->storePlayers($players);
            $this->statsService->storePlayerStats($players);
        }

        $this->service->syncTeamPlayers($leagueId, $season);

        $stats = $this->service->stats();

        $this->info('Spelers verwerkt: '.$stats['processed']);
        $this->info('Country ingevuld via team: '.$stats['country_filled']);
        $this->info('Spelers zonder country: '.$stats['missing_country']);
    }
}
