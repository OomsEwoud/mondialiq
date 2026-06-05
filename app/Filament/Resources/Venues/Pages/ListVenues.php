<?php

namespace App\Filament\Resources\Venues\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Venues\VenueResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListVenues extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = VenueResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => VenueResource::userIsSuperAdmin()),
        ];
    }
}
