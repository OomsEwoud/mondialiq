<?php

namespace App\Filament\Resources\MissingPlayers\Pages;

use App\Filament\Resources\MissingPlayers\MissingPlayerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListMissingPlayers extends ListRecords
{
    protected static string $resource = MissingPlayerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => MissingPlayerResource::userCanManageMissingPlayers()),
        ];
    }
}
