<?php

namespace App\Filament\Resources\BetTypes\Pages;

use App\Filament\Resources\BetTypes\BetTypeResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditBetType extends EditRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = BetTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->visible(fn (): bool => BetTypeResource::userIsSuperAdmin()),
        ];
    }
}
