<?php

use App\Models\Fixture;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$hasMatchToday = static fn (): bool => Fixture::query()
    ->whereDate('match_date', now()->toDateString())
    ->exists();

Schedule::command('app:add-countries')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-leagues')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-teams')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-players')
    ->weekly()
    ->withoutOverlapping();

Schedule::command('app:add-fixtures')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('app:add-standings')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('app:add-bookmakers')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-predictions')
    ->hourly()
    ->when($hasMatchToday)
    ->withoutOverlapping();

Schedule::command('app:add-predictions')
    ->dailyAt('03:00')
    ->skip($hasMatchToday)
    ->withoutOverlapping();

Schedule::command('app:add-coaches')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-venues')
    ->daily()
    ->withoutOverlapping();

Schedule::command('app:add-fixture-data')
    ->everyFifteenMinutes()
    ->withoutOverlapping();

Schedule::command('app:assign-league-owners')
    ->daily()
    ->withoutOverlapping();
