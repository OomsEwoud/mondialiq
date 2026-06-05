<?php

namespace App\Filament\Resources\Referees\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Referees\RefereeResource;
use Filament\Resources\Pages\CreateRecord;

class CreateReferee extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = RefereeResource::class;
}
