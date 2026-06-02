<?php

use App\Console\Commands\SyncWorldCupData;
use Illuminate\Console\OutputStyle;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

test('the world cup data sync command runs the configured imports in order', function () {
    $command = Mockery::mock(SyncWorldCupData::class)->makePartial();

    foreach ([
        ['app:add-countries', []],
        ['app:add-leagues', []],
        ['app:add-teams', []],
        ['app:add-fixtures', []],
        ['app:add-players', []],
        ['app:add-coaches', []],
        ['app:add-venues', []],
        ['app:add-standings', []],
        ['app:add-bookmakers', []],
        ['app:add-odds', ['--days' => 90]],
        ['app:add-predictions', []],
        ['app:add-missing-players', []],
        ['app:import-head-to-head', ['--force' => true]],
        ['app:import-team-statistics', ['--force' => true]],
        ['app:add-fixture-data', []],
        ['app:add-fixture-player-stats', []],
        ['app:generate-ai-predictions', ['--days' => 14]],
    ] as [$subCommand, $arguments]) {
        $command
            ->shouldReceive('call')
            ->once()
            ->ordered()
            ->with($subCommand, $arguments)
            ->andReturn(SyncWorldCupData::SUCCESS);
    }

    $command->setLaravel(app());
    $command->setInput(new ArrayInput([]));
    $command->setOutput(new OutputStyle(new ArrayInput([]), new BufferedOutput));

    $exitCode = $command->handle();

    expect($exitCode)->toBe(SyncWorldCupData::SUCCESS);
});
