<?php

return [
    // Explicit pairs prevent accidental league/season cross products.
    'competitions' => env('API_FOOTBALL_COMPETITIONS'),
    'live_sync_enabled' => env('API_FOOTBALL_LIVE_SYNC_ENABLED', true),
    'quota' => [
        'warning_percent' => env('API_FOOTBALL_QUOTA_WARNING_PERCENT', 25),
        'critical_percent' => env('API_FOOTBALL_QUOTA_CRITICAL_PERCENT', 10),
        'reserve' => env('API_FOOTBALL_QUOTA_RESERVE', 500),
        'minute_reserve' => env('API_FOOTBALL_MINUTE_RESERVE', 2),
    ],
];
