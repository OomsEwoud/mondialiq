<?php

namespace App\Filament\Resources\Leagues\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Leagues\LeagueResource;
use Filament\Resources\Pages\CreateRecord;

class CreateLeague extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = LeagueResource::class;
}
