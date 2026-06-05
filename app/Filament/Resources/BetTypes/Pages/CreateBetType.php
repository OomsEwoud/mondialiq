<?php

namespace App\Filament\Resources\BetTypes\Pages;

use App\Filament\Resources\BetTypes\BetTypeResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Resources\Pages\CreateRecord;

class CreateBetType extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = BetTypeResource::class;
}
