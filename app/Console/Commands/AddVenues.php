<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Venue\VenueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-venues')]
#[Description('Synchroniseer venues in de database')]
class AddVenues extends Command
{
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly VenueService $venueService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runDatabaseSyncTask(
            'Ophalen van stadions',
            'Opslaan van stadions in database',
            function (): void {
                $this->venueService->syncVenues();
            },
            'Stadions klaar',
        );
    }
}
