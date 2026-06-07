<?php

use Illuminate\Console\Scheduling\Schedule;

test('the fixture data scheduler is registered with logging and the correct cadence', function () {

    $events = collect(app(Schedule::class)->events())
        ->filter(fn ($event) => str_contains($event->command ?? '', 'app:add-fixture-data'))
        ->values();

    expect($events)->toHaveCount(1);

    $everyMinuteEvent = $events->first(fn ($event) => $event->expression === '* * * * *');

    expect($everyMinuteEvent)->not->toBeNull();

    expect($everyMinuteEvent->output)->toBe(storage_path('logs/add-fixture-data.log'))
        ->and($everyMinuteEvent->shouldAppendOutput)->toBeTrue()
        ->and($everyMinuteEvent->filtersPass(app()))->toBeTrue()
        ->and($events->first(fn ($event) => $event->expression === '0 0 * * *'))->toBeNull();
});
