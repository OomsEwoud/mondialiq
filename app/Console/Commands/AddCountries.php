<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-countries')]
#[Description('Haal landen op uit de Football API en sla ze op')]
class AddCountries extends Command
{
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly CountryService $countriesService,
        private readonly FootballApiService $api,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runFootballApiImport(
            'Ophalen van countries',
            'Data van countries opslaan in database',
            fn (): array => $this->api->getCountries(),
            function (array $countries): void {
                $this->countriesService->storeAllCountries($countries);
            },
            'Countries klaar',
        );
    }
}
