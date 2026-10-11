<?php

namespace App\Console\Commands;

use App\Services\Football\FixtureSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-data')]
#[Description('Compatibiliteitscommand; gebruik football:sync live')]
class AddFixtureData extends Command
{
    public function handle(FixtureSyncService $service): int
    {
        return $service->run('live', false) === 0 ? self::SUCCESS : self::FAILURE;
    }
}
