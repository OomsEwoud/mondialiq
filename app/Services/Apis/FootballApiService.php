<?php

namespace App\Services\Apis;

use App\Concerns\FootballApi\FixtureEndpoints;
use App\Concerns\FootballApi\MetadataEndpoints;
use App\Concerns\FootballApi\OddsEndpoint;
use App\Concerns\FootballApi\TeamEndpoints;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Sleep;
use RuntimeException;

class FootballApiService
{
    use FixtureEndpoints, MetadataEndpoints, OddsEndpoint, TeamEndpoints;

    private const string API_KEY_HEADER = 'x-apisports-key';

    private const int CONNECT_TIMEOUT_SECONDS = 5;

    private const int REQUEST_TIMEOUT_SECONDS = 20;

    private readonly string $baseUrl;

    private readonly string $apiKey;

    public function __construct()
    {
        $this->baseUrl = $this->configString('services.api_football.base_url');
        $this->apiKey = $this->configString('services.api_football.api_key');
    }

    private function rawCall(string $endpoint, array $params = []): array
    {
        $cacheParams = $params;
        ksort($cacheParams);
        $key = 'football:response:'.hash('sha256', $this->baseUrl.$this->apiKey.$endpoint.json_encode($cacheParams));
        $ttl = (int) (config('football_sync.reference_ttl')[$endpoint] ?? 10);

        return Cache::lock($key.':lock', 90)->block(5, fn (): array => Cache::remember(
            $key, $ttl, fn (): array => $this->request($endpoint, $params),
        ));
    }

    private function request(string $endpoint, array $params): array
    {
        $budgetKey = 'football:budget:'.hash('sha256', $this->apiKey);

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            if (Cache::has($budgetKey.':paused') || ! RateLimiter::attempt($budgetKey, (int) config('football_sync.max_requests_per_minute', 60), fn () => true, 60)) {
                throw new FootballApiBudgetExceeded($attempt > 1);
            }

            try {
                $response = $this->httpClient()->get($this->url($endpoint), $params);
            } catch (ConnectionException) {
                $this->recordRequest($endpoint, $attempt, null);
                if ($attempt === 2) {
                    throw new RuntimeException("API call to {$endpoint} failed: connection error.");
                }
                Sleep::for(500)->milliseconds();

                continue;
            }

            $this->recordRequest($endpoint, $attempt, $response);
            $dailyRemaining = $response->header('x-ratelimit-requests-remaining');
            $minuteRemaining = $response->header('X-RateLimit-Remaining');
            if ($dailyRemaining === '0') {
                Cache::put($budgetKey.':paused', true, now('UTC')->endOfDay()->addSecond());
            } elseif ($response->status() === 429 || $minuteRemaining === '0') {
                Cache::put($budgetKey.':paused', true, max(60, min(3600, (int) $response->header('Retry-After'))));
            }

            if ($response->serverError() && $attempt < 2) {
                Sleep::for(500)->milliseconds();

                continue;
            }

            if ($response->failed()) {
                throw new RuntimeException("API call to {$endpoint} failed with status {$response->status()}");
            }

            $json = $response->json();
            if (! is_array($json) || ! isset($json['response']) || ! is_array($json['response']) || ! empty($json['errors'])) {
                throw new RuntimeException("API call to {$endpoint} returned an invalid payload or API errors.");
            }

            return $json;
        }

        throw new RuntimeException('API Football retry limit reached.');
    }

    private function recordRequest(string $endpoint, int $attempt, ?Response $response): void
    {
        Log::info('football_api.request', [
            'endpoint' => $endpoint,
            'calls' => 1,
            'caller' => app(FootballApiContext::class)->caller(),
            'timestamp' => now('UTC')->toIso8601String(),
            'status' => $response?->status(),
            'attempt' => $attempt,
            'daily_remaining' => $response?->header('x-ratelimit-requests-remaining'),
            'minute_remaining' => $response?->header('X-RateLimit-Remaining'),
            'api_error' => $response ? ! empty($response->json('errors')) : false,
        ]);
    }

    private function call(string $endpoint, array $params = []): array
    {
        return $this->responseItems($this->rawCall($endpoint, $params));
    }

    private function callAllPages(string $endpoint, array $params = []): array
    {
        $json = $this->rawCall($endpoint, [...$params, 'page' => 1]);
        $results = $this->responseItems($json);
        $totalPages = $this->totalPages($json);

        for ($page = 2; $page <= $totalPages; $page++) {
            $json = $this->rawCall($endpoint, [...$params, 'page' => $page]);
            $results = [...$results, ...$this->responseItems($json)];
        }

        return $results;
    }

    private function configString(string $key): string
    {
        $value = config($key);

        if (! is_string($value) || $value === '') {
            throw new RuntimeException('API Football configuratie ontbreekt of is ongeldig.');
        }

        return $value;
    }

    private function httpClient(): PendingRequest
    {
        return Http::withHeaders([
            self::API_KEY_HEADER => $this->apiKey,
        ])
            ->connectTimeout(self::CONNECT_TIMEOUT_SECONDS)
            ->timeout(self::REQUEST_TIMEOUT_SECONDS);
    }

    private function url(string $endpoint): string
    {
        return "{$this->baseUrl}{$endpoint}";
    }

    private function responseItems(array $json): array
    {
        $response = $json['response'] ?? [];

        return is_array($response) ? $response : [];
    }

    private function totalPages(array $json): int
    {
        $totalPages = $json['paging']['total'] ?? 1;

        if (! is_numeric($totalPages)) {
            return 1;
        }

        return max(1, (int) $totalPages);
    }
}
