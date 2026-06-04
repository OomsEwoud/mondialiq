<?php

namespace App\Filament\Resources\Teams\Pages;

use App\Filament\Resources\Teams\TeamResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTeam extends EditRecord
{
    protected static string $resource = TeamResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (TeamResource::userIsSuperAdmin()) {
            return $data;
        }

        unset($data['country_id'], $data['external_id']);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => TeamResource::userIsSuperAdmin()),
        ];
    }
}
