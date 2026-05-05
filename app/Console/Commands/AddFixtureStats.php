<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Services\Fixture\FixtureStatsService;
use App\Services\Apis\FootballApiService;
use App\Models\Fixture;
use Exception;

#[Signature('app:add-fixture-stats')]
#[Description('Command description')]
class AddFixtureStats extends Command
{
    public function __construct(protected FootballApiService $api, protected FixtureStatsService $service)
    {
        parent::__construct();
    }
    public function handle()
    {
        $this->info('Ophalen van fixture stats');
        $fixtures = Fixture::all();

        $this->withProgressBar($fixtures, function (Fixture $fixture){
            try {
                 $stats = $this->api->getFixtureStats($fixture->external_id);
                 $this->service->storeFixtureStats($stats, $fixture->id);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen fixture stats voor fixture {$fixture->id}: " . $e->getMessage());
            }
        });
        
        $this->newLine();
        $this->info('Alle fixture stats zijn geupdate');

    }
}
