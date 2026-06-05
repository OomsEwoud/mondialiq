<?php

namespace App\Filament\Resources\Fixtures\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Fixtures\FixtureResource;
use Filament\Resources\Pages\CreateRecord;

class CreateFixture extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = FixtureResource::class;
}
