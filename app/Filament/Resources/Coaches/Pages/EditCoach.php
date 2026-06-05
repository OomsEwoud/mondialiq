<?php

namespace App\Filament\Resources\Coaches\Pages;

use App\Filament\Resources\Coaches\CoachResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCoach extends EditRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = CoachResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (CoachResource::userIsSuperAdmin()) {
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
                ->visible(fn (): bool => CoachResource::userIsSuperAdmin()),
        ];
    }

    private function structuralFields(): array
    {
        return [
            'external_id',
            'team_id',
            'country_id',
        ];
    }
}
