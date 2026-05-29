<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Bookmaker\BookmakerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-bookmakers')]
#[Description('Haal bookmakers op uit de Football API en sla ze op')]
class AddBookmakers extends Command
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly BookmakerService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van bookmakers');
        $bookmakers = [];

        $this->components->task('Data uit API ophalen', function () use (&$bookmakers) {
            $bookmakers = $this->api->getBookmakers();
        });

        $this->components->task('Data van bookmakers opslaan in database', function () use ($bookmakers) {
            if (! empty($bookmakers)) {
                $this->service->storeBookmakers($bookmakers);
            }
        });

        $this->info('Bookmakers klaar');

        return self::SUCCESS;
    }
}
