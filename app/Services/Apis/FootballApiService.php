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
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.api_football.base_url');
        $this->apiKey = config('services.api_football.api_key');
    }

    private function call(string $endpoint, array $params = [])
    {
        $response = Http::withHeaders([
            'x-apisports-key' => $this->apiKey,
        ])->get($this->baseUrl . $endpoint, $params);

        if ($response->failed()) {
            throw new Exception("API Call to {$endpoint} failed." . $response->json());
        }

        return $response->json()['response'] ?? [];
    }
}
