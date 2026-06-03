<?php

use App\Console\Commands\SyncAllData;
use Illuminate\Console\OutputStyle;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

test('the all data sync command runs the configured commands in order', function () {
    $command = Mockery::mock(SyncAllData::class)->makePartial();

    foreach ([
        'app:add-countries',
        'app:add-leagues',
        'app:add-teams',
        'app:add-fixtures',
        'app:add-players',
        'app:add-standings',
        'app:add-bookmakers',
        'app:add-predictions',
        'app:add-coaches',
        'app:add-venues',
        'app:add-missing-players',
        'app:import-head-to-head',
        'app:import-team-statistics',
        'app:add-fixture-lineups',
        'app:add-fixture-data',
        'app:add-fixture-player-stats',
    ] as $subCommand) {
        $command
            ->shouldReceive('call')
            ->once()
            ->ordered()
            ->with($subCommand)
            ->andReturn(SyncAllData::SUCCESS);
    }

    $command->setLaravel(app());
    $command->setInput(new ArrayInput([]));
    $command->setOutput(new OutputStyle(new ArrayInput([]), new BufferedOutput));

    $exitCode = $command->handle();

    expect($exitCode)->toBe(SyncAllData::SUCCESS);
});

test('the all data sync command stops when a child command fails', function () {
    $command = Mockery::mock(SyncAllData::class)->makePartial();

    $command
        ->shouldReceive('call')
        ->once()
        ->ordered()
        ->with('app:add-countries')
        ->andReturn(SyncAllData::SUCCESS);

    $command
        ->shouldReceive('call')
        ->once()
        ->ordered()
        ->with('app:add-leagues')
        ->andReturn(SyncAllData::FAILURE);

    $command
        ->shouldNotReceive('call')
        ->with('app:add-teams');

    $command->setLaravel(app());
    $command->setInput(new ArrayInput([]));
    $command->setOutput(new OutputStyle(new ArrayInput([]), new BufferedOutput));

    $exitCode = $command->handle();

    expect($exitCode)->toBe(SyncAllData::FAILURE);
});
