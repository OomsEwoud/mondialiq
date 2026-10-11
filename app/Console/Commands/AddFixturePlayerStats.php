<?php

namespace App\Console\Commands;

use App\Services\Football\FixtureSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-player-stats')]
#[Description('Compatibiliteitscommand; gebruik football:sync post-match')]
class AddFixturePlayerStats extends Command
{
    public function handle(FixtureSyncService $service): int
    {
        return $service->run('player-stats', false) === 0 ? self::SUCCESS : self::FAILURE;
    }
}
