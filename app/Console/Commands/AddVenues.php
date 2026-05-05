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
    public function __construct(protected VenueService $venueService)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Ophalen van stadions');

        $this->components->task('Opslaan van coaches in database', function () {
            $this->venueService->syncVenues();
        });
        
        $this->info('Stadions klaar');
    }
}
