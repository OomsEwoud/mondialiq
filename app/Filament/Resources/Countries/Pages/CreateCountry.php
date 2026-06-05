<?php

namespace App\Filament\Resources\Countries\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Countries\CountryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCountry extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = CountryResource::class;
}
