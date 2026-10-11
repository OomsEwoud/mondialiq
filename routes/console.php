<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('football:sync fixtures')->dailyAt('00:05')->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('football:sync reference-data')->dailyAt('01:00')->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('football:sync live')->everyMinute()->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('football:sync pre-match')->everyFiveMinutes()->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('football:sync post-match')->everyFiveMinutes()->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('football:sync standings')->hourly()->withoutOverlapping()->onOneServer()->runInBackground();

Schedule::command('app:add-predictions')->dailyAt('02:00')->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('app:add-odds')->everySixHours()->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('app:generate-ai-predictions --days=3')->everySixHours()->withoutOverlapping()->onOneServer()->runInBackground();
Schedule::command('predictions:validate')->everyFourHours()->withoutOverlapping()->onOneServer();
