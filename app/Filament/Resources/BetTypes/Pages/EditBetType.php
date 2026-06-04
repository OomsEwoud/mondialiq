<?php

namespace App\Filament\Resources\BetTypes\Pages;

use App\Filament\Resources\BetTypes\BetTypeResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBetType extends EditRecord
{
    protected static string $resource = BetTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => BetTypeResource::userIsSuperAdmin()),
        ];
    }
}
