<?php

namespace App\Filament\Resources\Predictions\Pages;

use App\Filament\Resources\Predictions\PredictionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPrediction extends EditRecord
{
    protected static string $resource = PredictionResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (PredictionResource::userIsSuperAdmin()) {
            return $data;
        }

        unset(
            $data['fixture_id'],
            $data['user_id'],
            $data['winner_id'],
            $data['source'],
            $data['total_goals'],
            $data['home_goals'],
            $data['away_goals'],
            $data['confidence'],
            $data['advice'],
            $data['home_chance'],
            $data['draw_chance'],
            $data['away_chance'],
            $data['points'],
            $data['points_awarded_at'],
        );

        return $data;
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => PredictionResource::userIsSuperAdmin()),
        ];
    }
}
