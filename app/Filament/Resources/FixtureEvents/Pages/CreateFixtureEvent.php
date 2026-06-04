<?php

namespace App\Filament\Resources\FixtureEvents\Pages;

use App\Filament\Resources\FixtureEvents\FixtureEventResource;
use Filament\Resources\Pages\CreateRecord;

class CreateFixtureEvent extends CreateRecord
{
    protected static string $resource = FixtureEventResource::class;
}
