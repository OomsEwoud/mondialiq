<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Concerns\HasResourcePageSubheading;
use App\Filament\Resources\Users\UserResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    use HasResourcePageSubheading;

    protected static string $resource = UserResource::class;
}
