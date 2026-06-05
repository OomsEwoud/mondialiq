<?php

namespace App\Filament\Resources\Referees\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Referees\RefereeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListReferees extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = RefereeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => RefereeResource::userIsSuperAdmin()),
        ];
    }
}
