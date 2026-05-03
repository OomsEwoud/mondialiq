<?php

namespace App\Services\Apis;

use App\Concerns\FootballApi\FixtureEndpoints;
use App\Concerns\FootballApi\MetadataEndpoints;
use App\Concerns\FootballApi\PlayersStatsEndpoints;
use App\Concerns\FootballApi\TeamEndpoints;
use Illuminate\Support\Facades\Http;
use Exception;

class FootballApiService
{
    use FixtureEndpoints, MetadataEndpoints, PlayersStatsEndpoints, TeamEndpoints;

    private readonly string $baseUrl;
    private readonly string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.api_football.base_url');
        $this->apiKey = config('services.api_football.api_key');
    }

    private function rawCall(string $endpoint, array $params = []): array
    {
        $response = Http::withHeaders([
            'x-apisports-key' => $this->apiKey,
        ])->get("{$this->baseUrl}{$endpoint}", $params);

        if ($response->failed()) {
            throw new Exception("API Call to {$endpoint} failed.");
        }

        return $response->json();
    }

    private function call(string $endpoint, array $params = []): array
    {
        return $this->rawCall($endpoint, $params)['response'] ?? [];
    }

    private function callAllPages(string $endpoint, array $params = []): array
    {
        $json = $this->rawCall($endpoint, [... $params, ...['page' => 1]]);
        $results = $json['response'] ?? [];
        $totalPages = $json['paging']['total'] ?? 1;

        for ($page = 2; $page <= $totalPages; $page++) {
            $json = $this->rawCall($endpoint, [... $params, ...['page' => $page]]);
            $results = [...$results, ...($json['response'] ?? [])];
        }

        return $results;
    }
}
