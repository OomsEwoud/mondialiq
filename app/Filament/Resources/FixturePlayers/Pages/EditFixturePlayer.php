<?php

namespace App\Filament\Resources\FixturePlayers\Pages;

use App\Filament\Resources\FixturePlayers\FixturePlayerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFixturePlayer extends EditRecord
{
    protected static string $resource = FixturePlayerResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (FixturePlayerResource::userIsSuperAdmin()) {
            return $data;
        }

        unset($data['fixture_id'], $data['team_id'], $data['player_id']);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => FixturePlayerResource::userIsSuperAdmin()),
        ];
    }
}
