<?php

use App\Models\Fixture;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$hasFixtureInProgress = static fn (): bool => Fixture::query()
    ->whereIn('status', ['1H', 'HT', '2H', 'ET', 'P', 'LIVE'])
    ->exists();

Schedule::command('app:add-countries')->monthly()->withoutOverlapping();

Schedule::command('app:add-leagues')->monthly()->withoutOverlapping();

Schedule::command('app:add-teams')->monthly()->withoutOverlapping();

Schedule::command('app:add-players')->daily()->withoutOverlapping();

Schedule::command('app:add-fixtures')->daily()->withoutOverlapping();

if (now()->between('2026-06-11', '2026-07-19')) {
    Schedule::command('app:add-standings')->hourly()->withoutOverlapping();
} else {
    Schedule::command('app:add-standings')->daily()->withoutOverlapping();
}

Schedule::command('app:add-bookmakers')->monthly()->withoutOverlapping();

Schedule::command('app:add-predictions')->hourly()->when($hasFixtureInProgress)->withoutOverlapping();

Schedule::command('app:add-predictions')->dailyAt('03:00')->skip($hasFixtureInProgress)->withoutOverlapping();

Schedule::command('app:add-coaches')->monthly()->withoutOverlapping();

Schedule::command('app:add-venues')->monthly()->withoutOverlapping();

Schedule::command('app:add-fixture-data')
    ->everyFifteenMinutes()
    ->withoutOverlapping();


