<?php

namespace App\Filament\Resources\FixtureEvents\Pages;

use App\Filament\Resources\FixtureEvents\FixtureEventResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFixtureEvents extends ListRecords
{
    protected static string $resource = FixtureEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => FixtureEventResource::userIsSuperAdmin()),
        ];
    }
}
