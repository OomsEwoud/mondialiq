<?php

return [
    'batch_fixtures' => env('FOOTBALL_SYNC_BATCH_FIXTURES', true),
    'max_fixtures_per_run' => 100,
    'max_requests_per_minute' => env('FOOTBALL_SYNC_REQUESTS_PER_MINUTE', 60),
    'lineup_max_attempts' => 4,
    'final_max_attempts' => 3,
    'enrichment_window_hours' => 72,
    'calendar_full_refresh_days' => 7,
    'players_active_refresh_days' => 7,
    'players_idle_refresh_days' => 28,
    'reference_ttl' => [
        '/countries' => 2592000,
        '/leagues' => 2592000,
        '/odds/bookmakers' => 2592000,
        '/venues' => 2592000,
        '/teams' => 604800,
        '/coachs' => 2592000,
        '/players/squads' => 86400,
        '/players' => 86400,
        '/predictions' => 86400,
        '/odds' => 21600,
    ],
];
