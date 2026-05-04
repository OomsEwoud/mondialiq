<?php

namespace App\Console\Commands;

use App\Models\Venue;
use App\Services\Apis\FootballApiService;
use App\Services\Venue\VenueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-venues')]
#[Description('Command description')]
class AddVenues extends Command
{
    public function __construct(protected FootballApiService $footballApiService, protected VenueService $venueService)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        Venue::whereNotNull('external_id')->chunk(100, function ($venues) {
            foreach ($venues as $venue) {
                $venueData = $this->footballApiService->getVenue($venue->external_id);
                $this->venueService->storeVenues($venueData);
            }
        });
    }
}
