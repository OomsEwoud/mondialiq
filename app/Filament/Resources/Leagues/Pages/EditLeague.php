<?php

namespace App\Filament\Resources\Leagues\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Leagues\LeagueResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLeague extends EditRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = LeagueResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (LeagueResource::userIsSuperAdmin()) {
            return $data;
        }

        unset($data['country_id'], $data['external_id']);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => LeagueResource::userIsSuperAdmin()),
        ];
    }
}
