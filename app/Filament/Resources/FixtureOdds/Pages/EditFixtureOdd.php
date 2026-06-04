<?php

namespace App\Filament\Resources\FixtureOdds\Pages;

use App\Filament\Resources\FixtureOdds\FixtureOddResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFixtureOdd extends EditRecord
{
    protected static string $resource = FixtureOddResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (FixtureOddResource::userIsSuperAdmin()) {
            return $data;
        }

        unset($data['external_bookmaker_id'], $data['external_bet_id']);

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => FixtureOddResource::userIsSuperAdmin()),
        ];
    }
}
