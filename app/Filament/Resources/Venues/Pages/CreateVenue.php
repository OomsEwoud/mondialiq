<?php

namespace App\Filament\Resources\Venues\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Venues\VenueResource;
use Filament\Resources\Pages\CreateRecord;

class CreateVenue extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = VenueResource::class;
}
