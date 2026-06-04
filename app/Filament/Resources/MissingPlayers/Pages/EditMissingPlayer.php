<?php

namespace App\Filament\Resources\MissingPlayers\Pages;

use App\Filament\Resources\MissingPlayers\MissingPlayerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditMissingPlayer extends EditRecord
{
    protected static string $resource = MissingPlayerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => MissingPlayerResource::userIsSuperAdmin()),
        ];
    }
}
