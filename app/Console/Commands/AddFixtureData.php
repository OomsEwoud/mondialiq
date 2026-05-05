<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Services\Fixture\FixtureStatsService;
use App\Services\Apis\FootballApiService;
use App\Models\Fixture;
use App\Services\Fixture\FixtureEventsService;
use Exception;

#[Signature('app:add-fixture-data')]
#[Description('Command description')]
class AddFixtureData extends Command
{
    public function __construct(protected FootballApiService $api, protected FixtureStatsService $statsService, protected FixtureEventsService $eventsService)
    {
        parent::__construct();
    }
    public function handle()
    {  
        $fixtures = Fixture::all();
        $this->info('Ophalen van fixture data');

        $this->withProgressBar($fixtures, function (Fixture $fixture){
            try {
                 $stats = $this->api->getFixtureStats($fixture->external_id);
                 $this->statsService->storeFixtureStats($stats, $fixture->id);

                 $events = $this->api->getFixtureEvents($fixture->external_id);
                 $this->eventsService->storeFixtureEvents($events, $fixture->id);
                 sleep(1);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen fixture {$fixture->id}: " . $e->getMessage());
            }
        });

        $this->newLine();
        $this->info('Alle fixture data is geupdate');
    }
}
