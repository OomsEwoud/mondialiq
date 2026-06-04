<?php

namespace App\Filament\Resources\Bookmakers\Pages;

use App\Filament\Resources\Bookmakers\BookmakerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBookmaker extends EditRecord
{
    protected static string $resource = BookmakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => BookmakerResource::userIsSuperAdmin()),
        ];
    }
}
