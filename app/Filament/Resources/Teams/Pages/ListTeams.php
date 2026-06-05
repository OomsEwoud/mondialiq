<?php

namespace App\Filament\Resources\Teams\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Teams\TeamResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTeams extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = TeamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
        ];
    }
}
