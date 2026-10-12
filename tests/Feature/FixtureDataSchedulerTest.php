<?php

use Illuminate\Console\Scheduling\Schedule;

test('the fixture data scheduler is registered with logging and the correct cadence', function () {

    $events = collect(app(Schedule::class)->events())
        ->filter(fn ($event) => str_contains($event->command ?? '', 'football:sync live'))
        ->values();

    expect($events)->toHaveCount(1);

    $everyMinuteEvent = $events->first(fn ($event) => $event->expression === '* * * * *');

    expect($everyMinuteEvent)->not->toBeNull();
    expect($everyMinuteEvent->withoutOverlapping)->toBeTrue()
        ->and($everyMinuteEvent->onOneServer)->toBeTrue()
        ->and($everyMinuteEvent->runInBackground)->toBeTrue();

    expect($everyMinuteEvent->filtersPass(app()))->toBeTrue()
        ->and($events->first(fn ($event) => $event->expression === '0 0 * * *'))->toBeNull();
});

test('football phases replace overlapping legacy schedules', function () {
    $events = collect(app(Schedule::class)->events());
    $football = $events->filter(fn ($event) => str_contains($event->command ?? '', 'football:sync'));

    expect($football)->toHaveCount(6);
    foreach ($football as $event) {
        expect($event->withoutOverlapping)->toBeTrue()->and($event->onOneServer)->toBeTrue();
    }

    expect($football->first(fn ($event) => str_contains($event->command, 'sync fixtures'))->expression)->toBe('5 0 * * *')
        ->and($football->first(fn ($event) => str_contains($event->command, 'sync reference-data'))->expression)->toBe('10 * * * *')
        ->and($football->first(fn ($event) => str_contains($event->command, 'sync pre-match'))->expression)->toBe('*/5 * * * *')
        ->and($football->first(fn ($event) => str_contains($event->command, 'sync post-match'))->expression)->toBe('*/5 * * * *')
        ->and($events->filter(fn ($event) => str_contains($event->command ?? '', 'app:add-fixture')))->toHaveCount(0);
});
