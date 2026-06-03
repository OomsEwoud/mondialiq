<?php

use App\Models\Fixture;
use Illuminate\Support\Facades\Schedule;

$hasPlayerStatsCandidate = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->readyForPlayerStatsSync()
    ->exists();

$hasActiveOrSoonFixture = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->where(fn ($query) => $query
        ->relevantForDataSync()
        ->orWhere(fn ($query) => $query->readyForFinalDataSync()))
    ->exists();

$hasLineupCandidate = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->readyForLineupSync()
    ->exists();

Schedule::command('app:add-countries')->monthly()->withoutOverlapping();

Schedule::command('app:add-leagues')->monthly()->withoutOverlapping();

Schedule::command('app:add-teams')->monthly()->withoutOverlapping();

Schedule::command('app:add-players')->daily()->withoutOverlapping();

Schedule::command('app:add-fixtures')->hourly()->withoutOverlapping();

Schedule::command('app:add-missing-players')->daily()->withoutOverlapping();

if (now()->between('2026-06-11', '2026-07-19')) {
    Schedule::command('app:add-standings')->hourly()->withoutOverlapping();
} else {
    Schedule::command('app:add-standings')->daily()->withoutOverlapping();
}

Schedule::command('app:add-bookmakers')->monthly()->withoutOverlapping();

Schedule::command('app:add-odds')->everyThreeHours()->withoutOverlapping();

Schedule::command('app:add-predictions')->everySixHours()->withoutOverlapping();

Schedule::command('app:add-coaches')->monthly()->withoutOverlapping();

Schedule::command('app:add-venues')->monthly()->withoutOverlapping();

Schedule::command('app:add-fixture-lineups')->everyFifteenMinutes()->when($hasLineupCandidate)->withoutOverlapping();

Schedule::command('app:add-fixture-data')->everyMinute()->when($hasActiveOrSoonFixture)->withoutOverlapping();

Schedule::command('app:add-fixture-data')->hourly()->skip($hasActiveOrSoonFixture)->withoutOverlapping();

Schedule::command('app:add-fixture-player-stats')->everyFifteenMinutes()->when($hasPlayerStatsCandidate)->withoutOverlapping();

Schedule::command('app:add-fixture-player-stats')->dailyAt('04:30')->skip($hasPlayerStatsCandidate)->withoutOverlapping();

Schedule::command('app:generate-ai-predictions --days=3')->everySixHours()->withoutOverlapping();
