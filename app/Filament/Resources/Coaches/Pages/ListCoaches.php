<?php

namespace App\Filament\Resources\Coaches\Pages;

use App\Filament\Resources\Coaches\CoachResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCoaches extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = CoachResource::class;

    protected static ?string $title = 'Unassigned Coaches';

    protected static ?string $breadcrumb = 'Unassigned Coaches';

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => CoachResource::userIsSuperAdmin()),
        ];
    }
}
