<?php

namespace App\Filament\Resources\BetTypes\Pages;

use App\Filament\Resources\BetTypes\BetTypeResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBetTypes extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = BetTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => BetTypeResource::userIsSuperAdmin()),
        ];
    }
}
