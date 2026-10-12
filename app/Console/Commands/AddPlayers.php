<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Football\CompetitionConfig;
use App\Services\Player\PlayerService;
use App\Services\Player\PlayerStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

#[Signature('app:add-players {--due : Only refresh competitions whose player data is due}')]
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
        return $this->forEachFootballCompetition(function (array $config): int {
            $pair = new CompetitionConfig($config['leagueId'], $config['season']);
            $active = $pair->constrain(Fixture::query())->whereBetween('match_date', [now('Europe/Brussels')->subDay(), now('Europe/Brussels')->addDays(14)])->exists();
            $key = 'football:players:'.$pair->key().':'.($active ? 'active' : 'idle');
            if ($this->option('due') && Cache::has($key)) {
                return self::SUCCESS;
            }
            $result = $this->runFootballApiImport(
                'Ophalen van players',
                'Data van players opslaan in database',
                fn (): array => $this->api->getPlayersByLeagueSeason($config['leagueId'], $config['season']),
                function (array $players) use ($config): void {
                    $this->storePlayers($players, $config['leagueId'], $config['season']);
                },
                'Players klaar',
                storeWhenEmpty: true,
            );
            if ($result === self::SUCCESS) {
                Cache::put($key, true, $active ? 86400 : 604800);
            }

            return $result;
        });
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
