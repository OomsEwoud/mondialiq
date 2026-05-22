<?php

namespace App\Services\Apis;

use App\Concerns\FootballApi\FixtureEndpoints;
use App\Concerns\FootballApi\MetadataEndpoints;
use App\Concerns\FootballApi\OddsEndpoint;
use App\Concerns\FootballApi\TeamEndpoints;
use Exception;
use Illuminate\Support\Facades\Http;

class FootballApiService
{
    use FixtureEndpoints, MetadataEndpoints, TeamEndpoints, OddsEndpoint;

    private readonly string $baseUrl;
    private readonly string $apiKey;

    public function __construct()
    {
        $baseUrl = config('services.api_football.base_url');
        $apiKey = config('services.api_football.api_key');

        if (! is_string($baseUrl) || $baseUrl === '' || ! is_string($apiKey) || $apiKey === '') {
            throw new Exception('API Football configuratie ontbreekt of is ongeldig.');
        }

        $this->baseUrl = $baseUrl;
        $this->apiKey = $apiKey;
    }

    private function rawCall(string $endpoint, array $params = []): array
    {
        $response = Http::withHeaders([
            'x-apisports-key' => $this->apiKey,
        ])
            ->connectTimeout(5)
            ->timeout(20)
            ->retry(2, 500)
            ->get("{$this->baseUrl}{$endpoint}", $params);

        if ($response->failed()) {
            $message = $response->json('message')
                ?? $response->json('errors')
                ?? $response->reason();

            throw new Exception("API call to {$endpoint} failed with status {$response->status()}: ".json_encode($message));
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }

    private function call(string $endpoint, array $params = []): array
    {
        return $this->rawCall($endpoint, $params)['response'] ?? [];
    }

    private function callAllPages(string $endpoint, array $params = []): array
    {
        $json = $this->rawCall($endpoint, [...$params, 'page' => 1]);
        $results = $json['response'] ?? [];
        $totalPages = $json['paging']['total'] ?? 1;

        for ($page = 2; $page <= $totalPages; $page++) {
            $json = $this->rawCall($endpoint, [...$params, 'page' => $page]);
            $results = [...$results, ...($json['response'] ?? [])];
        }

        return $results;
    }
}
