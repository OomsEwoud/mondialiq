<?php

namespace App\Filament\Resources\Fixtures\Pages;

use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFixture extends EditRecord
{
    protected static string $resource = FixtureResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (FixtureResource::userIsSuperAdmin()) {
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
                ->visible(fn (): bool => FixtureResource::userIsSuperAdmin()),
        ];
    }

    private function structuralFields(): array
    {
        return [
            'league_id',
            'home_team_id',
            'away_team_id',
            'venue_id',
            'referee_id',
            'match_date',
            'season',
            'round_name',
        ];
    }
}
