<?php

namespace App\Services\Apis;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class FootballApiBudget
{
    public function key(): string
    {
        return 'football:budget:'.hash('sha256', (string) config('services.api_football.api_key'));
    }

    public function available(): bool
    {
        return ! Cache::has($this->key().':paused')
            && ! RateLimiter::tooManyAttempts($this->key(), (int) config('football_sync.max_requests_per_minute', 60));
    }
}
