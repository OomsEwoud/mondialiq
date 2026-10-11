<?php

namespace App\Console\Commands;

use App\Services\Football\FixtureSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-lineups')]
#[Description('Compatibiliteitscommand; gebruik football:sync pre-match')]
class AddFixtureLineups extends Command
{
    public function handle(FixtureSyncService $service): int
    {
        return $service->run('pre-match', false) === 0 ? self::SUCCESS : self::FAILURE;
    }
}
