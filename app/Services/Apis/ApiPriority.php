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
            'live' => self::Critical,
            'pre-match', 'post-match', 'player-stats' => self::High,
            'reference-data' => self::Low,
            default => self::Normal,
        };
    }

    public static function forEndpoint(string $endpoint, array $params): self
    {
        return match ($endpoint) {
            '/fixtures' => isset($params['id']) || isset($params['ids']) || isset($params['live']) ? self::Critical : self::Normal,
            '/fixtures/events' => self::Critical,
            '/fixtures/lineups', '/fixtures/statistics', '/fixtures/players' => self::High,
            '/standings', '/predictions', '/odds' => self::Normal,
            '/countries', '/leagues', '/teams', '/odds/bookmakers', '/players', '/players/squads', '/coachs', '/venues' => self::Low,
            default => self::Background,
        };
    }
}
