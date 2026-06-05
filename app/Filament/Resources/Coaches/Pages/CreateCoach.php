<?php

namespace App\Filament\Resources\Coaches\Pages;

use App\Filament\Resources\Coaches\CoachResource;
use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use Filament\Resources\Pages\CreateRecord;

class CreateCoach extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = CoachResource::class;
}
