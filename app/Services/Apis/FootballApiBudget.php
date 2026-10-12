<?php

namespace App\Services\Apis;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use InvalidArgumentException;

class FootballApiBudget
{
    public function key(): string
    {
        return 'football:budget:'.hash('sha256', (string) config('services.api_football.api_key'));
    }

    public function available(ApiPriority $priority = ApiPriority::Critical): bool
    {
        return $this->canExecute($priority);
    }

    public function quota(): ?ApiQuota
    {
        return Cache::get($this->key().':quota');
    }

    public function status(): string
    {
        $this->validateThresholds();
        $quota = $this->quota();
        if ($quota === null || ! $quota->lastUpdatedAt->isSameDay(now('UTC'))) {
            return 'UNKNOWN';
        }
        $remaining = Cache::get($this->key().':daily', $quota->dailyRemaining);
        if ($remaining === null) {
            return 'UNKNOWN';
        }
        if ($remaining <= 0) {
            return 'EXHAUSTED';
        }
        if ($remaining <= config('api-football.quota.reserve', 500)) {
            return 'RESERVE';
        }
        if (! $quota->dailyLimit) {
            return 'UNKNOWN';
        }
        $percent = 100 * $remaining / $quota->dailyLimit;

        return match (true) {
            $percent <= config('api-football.quota.critical_percent', 10) => 'CRITICAL',
            $percent <= config('api-football.quota.warning_percent', 25) => 'WARNING',
            default => 'HEALTHY',
        };
    }

    public function canExecute(ApiPriority $priority): bool
    {
        $allowed = match ($this->status()) {
            'EXHAUSTED' => false,
            'RESERVE' => $priority === ApiPriority::Critical,
            'CRITICAL' => $priority->value <= ApiPriority::High->value,
            'WARNING' => $priority->value <= ApiPriority::Normal->value,
            default => true,
        };
        $minute = Cache::get($this->key().':minute');

        return $allowed && ! Cache::has($this->key().':paused')
            && ! RateLimiter::tooManyAttempts($this->key(), $this->minuteLimit())
            && ($minute === null || $minute > ($priority === ApiPriority::Critical ? 0 : (int) config('api-football.quota.minute_reserve', 2)));
    }

    public function reserve(ApiPriority $priority, bool $attempted): void
    {
        $lock = Cache::lock($this->key().':reservation', 10);
        if (! $lock->get()) {
            throw new FootballApiBudgetExceeded($attempted);
        }
        try {
            if (! $this->available($priority)) {
                throw new FootballApiBudgetExceeded($attempted);
            }
            RateLimiter::hit($this->key(), 60);
            foreach (['daily', 'minute'] as $period) {
                if (Cache::has($this->key().':'.$period)) {
                    Cache::decrement($this->key().':'.$period);
                }
            }
        } finally {
            $lock->release();
        }
    }

    public function observe(Response $response): void
    {
        $quota = ApiQuota::fromResponse($response);
        if ($quota->dailyLimit !== null || $quota->dailyRemaining !== null || $quota->minuteLimit !== null || $quota->minuteRemaining !== null) {
            Cache::lock($this->key().':reservation', 10)->block(5, function () use ($quota): void {
                $previous = $this->quota();
                $sameDay = $previous?->lastUpdatedAt->isSameDay($quota->lastUpdatedAt);
                Cache::put($this->key().':quota', new ApiQuota(
                    $quota->dailyLimit ?? ($sameDay ? $previous->dailyLimit : null),
                    $quota->dailyRemaining ?? ($sameDay ? $previous->dailyRemaining : null),
                    $quota->minuteLimit ?? $previous?->minuteLimit,
                    $quota->minuteRemaining,
                    $quota->lastUpdatedAt,
                ), now('UTC')->addDays(2));
                foreach (['daily' => $quota->dailyRemaining, 'minute' => $quota->minuteRemaining] as $period => $remaining) {
                    if ($remaining === null) {
                        continue;
                    }
                    $key = $this->key().':'.$period;
                    $remaining = min($remaining, Cache::get($key, $remaining));
                    // Preserve the minute window's original expiry; don't extend it on each response.
                    if ($period === 'minute' && Cache::has($key)) {
                        $difference = Cache::get($key) - $remaining;
                        if ($difference > 0) {
                            Cache::decrement($key, $difference);
                        }
                    } else {
                        Cache::put($key, $remaining, $period === 'daily' ? now('UTC')->addDay()->startOfDay() : 60);
                    }
                }
            });
        }
        if ($quota->dailyRemaining === 0) {
            Cache::put($this->key().':paused', true, now('UTC')->addDay()->startOfDay());
        } elseif ($response->status() === 429 || $quota->minuteRemaining === 0) {
            $header = $response->header('Retry-After');
            $seconds = is_numeric($header) ? (int) $header : max(0, (strtotime($header) ?: time()) - time());
            Cache::put($this->key().':paused', true, max(60, min(86400, $seconds)));
        }
    }

    public function recordUsage(string $endpoint, string $caller): void
    {
        $key = $this->key().':usage:'.now('UTC')->toDateString();
        Cache::lock($key.':lock', 10)->block(5, function () use ($key, $endpoint, $caller): void {
            $usage = Cache::get($key, []);
            $usage[$endpoint][$caller] = ($usage[$endpoint][$caller] ?? 0) + 1;
            Cache::put($key, $usage, now('UTC')->addDays(2));
        });
    }

    public function usage(): array
    {
        return Cache::get($this->key().':usage:'.now('UTC')->toDateString(), []);
    }

    private function minuteLimit(): int
    {
        return max(1, min((int) config('football_sync.max_requests_per_minute', 60), $this->quota()?->minuteLimit ?? PHP_INT_MAX));
    }

    private function validateThresholds(): void
    {
        $warning = config('api-football.quota.warning_percent', 25);
        $critical = config('api-football.quota.critical_percent', 10);
        if (! is_numeric($warning) || ! is_numeric($critical) || $critical < 0 || $warning <= $critical || $warning > 100
            || ! is_numeric(config('api-football.quota.reserve', 500)) || ! is_numeric(config('api-football.quota.minute_reserve', 2))
            || config('api-football.quota.reserve', 500) < 0 || config('api-football.quota.minute_reserve', 2) < 0) {
            throw new InvalidArgumentException('API Football quota-config ongeldig: 0 <= critical < warning <= 100; reserves moeten positief of nul zijn.');
        }
    }
}
