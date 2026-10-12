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
use Illuminate\Support\Sleep;
use RuntimeException;

class FootballApiService
{
    use FixtureEndpoints, MetadataEndpoints, OddsEndpoint, TeamEndpoints;

    private const string API_KEY_HEADER = 'x-apisports-key';

    private const int CONNECT_TIMEOUT_SECONDS = 5;

    private const int REQUEST_TIMEOUT_SECONDS = 20;

    private string $baseUrl;

    private string $apiKey;

    private function configure(): void
    {
        $this->baseUrl = $this->configString('services.api_football.base_url');
        $this->apiKey = $this->configString('services.api_football.api_key');
    }

    private function rawCall(string $endpoint, array $params = []): array
    {
        // Artisan also resolves import commands for quota-free status and dry runs.
        $this->configure();
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
        $budget = app(FootballApiBudget::class);
        $priority = app(FootballApiContext::class)->priority($endpoint, $params);

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            $budget->reserve($priority, $attempt > 1);
            $started = hrtime(true);

            try {
                $response = $this->httpClient()->get($this->url($endpoint), $params);
            } catch (ConnectionException) {
                $this->recordRequest($endpoint, $attempt, null, $started);
                if ($attempt === 2) {
                    throw new RuntimeException("API call to {$endpoint} failed: connection error.");
                }
                Sleep::for(500)->milliseconds();

                continue;
            }

            $budget->observe($response);
            $this->recordRequest($endpoint, $attempt, $response, $started);

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

    private function recordRequest(string $endpoint, int $attempt, ?Response $response, int $started): void
    {
        $caller = app(FootballApiContext::class)->caller();
        app(FootballApiBudget::class)->recordUsage($endpoint, $caller);
        Log::info('football_api.request', [
            'endpoint' => $endpoint,
            'calls' => 1,
            'caller' => $caller,
            'duration_ms' => round((hrtime(true) - $started) / 1_000_000, 2),
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
