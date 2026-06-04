<?php

namespace App\Filament\Resources\FixtureEvents\Pages;

use App\Filament\Resources\FixtureEvents\FixtureEventResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFixtureEvent extends EditRecord
{
    protected static string $resource = FixtureEventResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (FixtureEventResource::userIsSuperAdmin()) {
            return $data;
        }

        foreach ($this->structuralFields() as $field) {
            unset($data[$field]);
        }

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => FixtureEventResource::userIsSuperAdmin()),
        ];
    }

    private function structuralFields(): array
    {
        return [
            'fixture_id',
            'team_id',
            'player_id',
            'assist_id',
        ];
    }
}
