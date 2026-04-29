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
    protected CountryService $countriesService;
    protected FootballApiService $serviceFootball;

    public function __construct(CountryService $countriesService, FootballApiService $serviceFootball)
    {
        parent::__construct();
        $this->countriesService = $countriesService;
        $this->serviceFootball = $serviceFootball;
    }

    public function handle()
    {
        $countries = $this->serviceFootball->getCountries();
        
        $this->countriesService->storeAllCountries($countries);
    }
}
