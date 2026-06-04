<?php

namespace App\Filament\Resources\FixturePlayers\Pages;

use App\Filament\Resources\FixturePlayers\FixturePlayerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFixturePlayers extends ListRecords
{
    protected static string $resource = FixturePlayerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => FixturePlayerResource::userIsSuperAdmin()),
        ];
    }
}
