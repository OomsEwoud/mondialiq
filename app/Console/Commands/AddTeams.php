<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Services\Apis\FootballApiService;
use App\Services\Team\TeamService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-teams')]
#[Description('Haal teams op uit de Football API en sla ze op')]
class AddTeams extends Command
{
    use InteractsWithFootballApiConfig;

    public function __construct(
        private readonly TeamService $teamService,
        private readonly FootballApiService $api,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        $this->info('Ophalen van teams');
        $teams = [];

        $this->components->task('Data uit API ophalen', function () use (&$teams, $config) {
            $teams = $this->api->getTeams($config['leagueId'], $config['season']);
        });

        $this->components->task('Data van teams opslaan in database', function () use ($teams) {
            if (! empty($teams)) {
                $this->teamService->storeTeams($teams);
            }
        });

        $this->info('Teams klaar');

        return self::SUCCESS;
    }
}
