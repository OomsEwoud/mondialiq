<?php

namespace App\Filament\Resources\FixtureOdds\Pages;

use App\Filament\Resources\FixtureOdds\FixtureOddResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFixtureOdds extends ListRecords
{
    protected static string $resource = FixtureOddResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => FixtureOddResource::userCanManageFixtureOdds()),
        ];
    }
}
