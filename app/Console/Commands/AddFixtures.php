<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixtures')]
#[Description('Command description')]
class AddFixtures extends Command
{
    public function __construct(protected FootballApiService $api, protected FixtureService $service)
    {
        parent::__construct();
    }
    
    public function handle(): void
    {
        $fixtures = $this->api->getFixtures(config('services.api_football.league_id'), config('services.api_football.season'));
        $this->service->storeFixtures($fixtures);
    }
}
