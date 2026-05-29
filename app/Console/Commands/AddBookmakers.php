<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Bookmaker\BookmakerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-bookmakers')]
#[Description('Haal bookmakers op uit de Football API en sla ze op')]
class AddBookmakers extends Command
{
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly BookmakerService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runFootballApiImport(
            'Ophalen van bookmakers',
            'Data van bookmakers opslaan in database',
            fn (): array => $this->api->getBookmakers(),
            function (array $bookmakers): void {
                $this->service->storeBookmakers($bookmakers);
            },
            'Bookmakers klaar',
        );
    }
}
