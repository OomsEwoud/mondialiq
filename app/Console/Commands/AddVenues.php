<?php

namespace App\Console\Commands;

use App\Services\Venue\VenueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-venues')]
#[Description('Synchroniseer venues in de database')]
class AddVenues extends Command
{
    public function __construct(protected VenueService $venueService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van stadions');

        $this->components->task('Opslaan van stadions in database', function () {
            $this->venueService->syncVenues();
        });

        $this->info('Stadions klaar');

        return self::SUCCESS;
    }
}
