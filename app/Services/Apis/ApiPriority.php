<?php

namespace App\Services\Apis;

enum ApiPriority: int
{
    case Critical = 0;
    case High = 1;
    case Normal = 2;
    case Low = 3;
    case Background = 4;

    public static function forPhase(string $phase): self
    {
        return match ($phase) {
            'live', 'post-match' => self::Critical,
            'pre-match' => self::High,
            'reference-data', 'player-stats' => self::Low,
            default => self::Normal,
        };
    }

    public static function forEndpoint(string $endpoint, array $params): self
    {
        return match ($endpoint) {
            '/fixtures' => isset($params['id']) || isset($params['ids']) || isset($params['live']) ? self::Critical : self::Normal,
            '/fixtures/events', '/fixtures/lineups', '/fixtures/statistics' => self::High,
            '/standings', '/predictions', '/odds' => self::Normal,
            '/players', '/players/squads', '/coachs', '/venues', '/fixtures/players' => self::Low,
            default => self::Background,
        };
    }
}
