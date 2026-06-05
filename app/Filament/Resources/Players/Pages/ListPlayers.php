<?php

namespace App\Filament\Resources\Players\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Players\PlayerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPlayers extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = PlayerResource::class;

    protected static ?string $title = 'Unassigned Players';

    protected static ?string $breadcrumb = 'Unassigned Players';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => PlayerResource::userIsSuperAdmin()),
        ];
    }
}
