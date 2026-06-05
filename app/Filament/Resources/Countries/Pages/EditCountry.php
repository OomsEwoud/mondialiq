<?php

namespace App\Filament\Resources\Countries\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Countries\CountryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCountry extends EditRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = CountryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => CountryResource::userIsSuperAdmin()),
        ];
    }
}
