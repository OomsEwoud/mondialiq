<?php

namespace App\Filament\Resources\Players\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Players\PlayerResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePlayer extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = PlayerResource::class;
}
