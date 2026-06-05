<?php

namespace App\Filament\Resources\Teams\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Teams\TeamResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTeam extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = TeamResource::class;
}
