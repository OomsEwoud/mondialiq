<?php

namespace App\Filament\Resources\Players\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Players\PlayerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPlayer extends EditRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = PlayerResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (PlayerResource::userIsSuperAdmin()) {
            return $data;
        }

        unset($data['country_id'], $data['external_id']);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => PlayerResource::userIsSuperAdmin()),
        ];
    }
}
