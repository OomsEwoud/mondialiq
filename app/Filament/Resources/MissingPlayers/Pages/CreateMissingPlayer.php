<?php

namespace App\Filament\Resources\MissingPlayers\Pages;

use App\Filament\Resources\MissingPlayers\MissingPlayerResource;
use Filament\Resources\Pages\CreateRecord;

class CreateMissingPlayer extends CreateRecord
{
    protected static string $resource = MissingPlayerResource::class;
}
