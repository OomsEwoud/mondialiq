<?php

namespace App\Console\Commands;

use App\Services\Country\Countries;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-countries')]
#[Description('Command description')]
class AddCountries extends Command
{
    public function __construct(protected CountryService $countriesService, protected FootballApiService $serviceFootball)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Ophalen van countries');
        $countries = [];

        $this->components->task('Data uit API ophalen', function () use (&$countries) {
            $countries = $this->serviceFootball->getCountries();
        });

        $this->components->task('Data van countries opslaan in database', function () use ($countries) {
            if (!empty($countries)) {
                $this->countriesService->storeAllCountries($countries);
            }
        });

        $this->info('Countries klaar');
    }
}
