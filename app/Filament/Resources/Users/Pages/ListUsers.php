<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Users\UserResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    use HasResourcePageSubheading;

    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->visible(fn (): bool => UserResource::userIsSuperAdmin()),
        ];
    }
}
