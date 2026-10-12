<?php

namespace App\Services\Apis;

use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Response;

final readonly class ApiQuota
{
    public function __construct(
        public ?int $dailyLimit,
        public ?int $dailyRemaining,
        public ?int $minuteLimit,
        public ?int $minuteRemaining,
        public CarbonImmutable $lastUpdatedAt,
    ) {}

    public static function fromResponse(Response $response): self
    {
        return new self(
            self::integerHeader($response, 'x-ratelimit-requests-limit'),
            self::integerHeader($response, 'x-ratelimit-requests-remaining'),
            self::integerHeader($response, 'X-RateLimit-Limit'),
            self::integerHeader($response, 'X-RateLimit-Remaining'),
            CarbonImmutable::now('UTC'),
        );
    }

    public function remainingPercent(): ?float
    {
        return $this->dailyLimit > 0 && $this->dailyRemaining !== null
            ? 100 * $this->dailyRemaining / $this->dailyLimit : null;
    }

    private static function integerHeader(Response $response, string $name): ?int
    {
        $value = trim($response->header($name));

        return ctype_digit($value) ? (int) $value : null;
    }
}
