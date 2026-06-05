<?php

namespace App\Filament\Resources\Bookmakers\Pages;

use App\Filament\Resources\Bookmakers\BookmakerResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBookmakers extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = BookmakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => BookmakerResource::userIsSuperAdmin()),
        ];
    }
}
