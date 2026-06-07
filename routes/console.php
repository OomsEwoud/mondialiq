<?php

use App\Models\Fixture;
use Illuminate\Support\Facades\Schedule;

$hasPlayerStatsCandidate = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->readyForPlayerStatsSync()
    ->exists();

$hasActiveOrSoonFixture = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->relevantForFixtureDataSync()
    ->exists();

$hasLineupCandidate = static fn (): bool => Fixture::query()
    ->whereNotNull('external_id')
    ->readyForLineupSync()
    ->exists();

Schedule::command('app:add-countries')->monthly()->withoutOverlapping();

Schedule::command('app:add-leagues')->monthly()->withoutOverlapping();

Schedule::command('app:add-teams')->monthly()->withoutOverlapping();

Schedule::command('app:add-players')->daily()->withoutOverlapping();

Schedule::command('app:add-fixture-data')->everyMinute()->withoutOverlapping();

Schedule::command('app:add-fixtures')->everyMinute()->when($hasActiveOrSoonFixture)->withoutOverlapping();

Schedule::command('app:add-fixtures')->daily()->skip($hasActiveOrSoonFixture)->withoutOverlapping();

Schedule::command('app:add-missing-players')->daily()->withoutOverlapping();

if (now()->between('2026-06-11', '2026-07-20')) {
    Schedule::command('app:add-standings')->hourly()->withoutOverlapping();
} else {
    Schedule::command('app:add-standings')->daily()->withoutOverlapping();
}

Schedule::command('app:add-bookmakers')->monthly()->withoutOverlapping();

//Schedule::command('app:add-odds')->everyThreeHours()->withoutOverlapping();

Schedule::command('app:add-predictions')->daily()->withoutOverlapping();

Schedule::command('app:add-coaches')->monthly()->withoutOverlapping();

Schedule::command('app:add-venues')->monthly()->withoutOverlapping();

Schedule::command('app:add-fixture-lineups')->everyTenMinutes()->when($hasLineupCandidate)->withoutOverlapping();

Schedule::command('app:add-fixture-player-stats')->everyMinute()->when($hasPlayerStatsCandidate)->withoutOverlapping();

Schedule::command('app:add-fixture-player-stats')->daily()->skip($hasPlayerStatsCandidate)->withoutOverlapping();

Schedule::command('app:generate-ai-predictions --days=3')->everySixHours()->withoutOverlapping();

Schedule::command('predictions:validate')->everyFourHours()->withoutOverlapping();
