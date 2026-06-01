<?php

namespace App\Services\Apis;

use App\Concerns\FootballApi\FixtureEndpoints;
use App\Concerns\FootballApi\MetadataEndpoints;
use App\Concerns\FootballApi\OddsEndpoint;
use App\Concerns\FootballApi\TeamEndpoints;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FootballApiService
{
    use FixtureEndpoints, MetadataEndpoints, TeamEndpoints, OddsEndpoint;

    private const string API_KEY_HEADER = 'x-apisports-key';
    private const int CONNECT_TIMEOUT_SECONDS = 5;
    private const int REQUEST_TIMEOUT_SECONDS = 20;
    private const int RETRY_TIMES = 2;
    private const int RETRY_SLEEP_MILLISECONDS = 500;

    private readonly string $baseUrl;
    private readonly string $apiKey;

    public function __construct()
    {
        $this->baseUrl = $this->configString('services.api_football.base_url');
        $this->apiKey = $this->configString('services.api_football.api_key');
    }

    private function rawCall(string $endpoint, array $params = []): array
    {
        $response = $this->httpClient()
            ->get($this->url($endpoint), $params);

        if ($response->failed()) {
            throw new RuntimeException($this->failureMessage($endpoint, $response));
        }

        return $this->json($response);
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
            ->timeout(self::REQUEST_TIMEOUT_SECONDS)
            ->retry(self::RETRY_TIMES, self::RETRY_SLEEP_MILLISECONDS, throw: false);
    }

    private function url(string $endpoint): string
    {
        return "{$this->baseUrl}{$endpoint}";
    }

    private function failureMessage(string $endpoint, Response $response): string
    {
        $message = $response->json('message')
            ?? $response->json('errors')
            ?? $response->reason();

        $encodedMessage = json_encode($message) ?: $this->fallbackFailureMessage($message);

        return "API call to {$endpoint} failed with status {$response->status()}: {$encodedMessage}";
    }

    private function fallbackFailureMessage(mixed $message): string
    {
        return is_scalar($message) ? (string) $message : 'Unknown API error';
    }

    private function json(Response $response): array
    {
        $json = $response->json();

        return is_array($json) ? $json : [];
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
