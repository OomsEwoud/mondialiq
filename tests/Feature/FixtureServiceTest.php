<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\Venue;
use App\Services\Fixture\FixtureService;

test('it stores venues with zero external ids as unknown venues', function () {
    $league = League::query()->create([
        'external_id' => 39,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 1,
        'name' => 'Home Team',
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 2,
        'name' => 'Away Team',
        'code' => 'AWA',
        'logo_url' => 'https://example.com/away.png',
    ]);

    app(FixtureService::class)->storeFixtures([
        fixturePayloadWithVenue(
            fixtureId: 1001,
            leagueId: $league->external_id,
            homeTeamId: $homeTeam->external_id,
            awayTeamId: $awayTeam->external_id,
            venueName: 'zondacrypto Arena',
            venueCity: 'Czestochowa',
        ),
        fixturePayloadWithVenue(
            fixtureId: 1002,
            leagueId: $league->external_id,
            homeTeamId: $homeTeam->external_id,
            awayTeamId: $awayTeam->external_id,
            venueName: 'Estadio Municipal',
            venueCity: 'Madrid',
        ),
    ]);

    expect(Venue::query()->whereNull('external_id')->count())->toBe(2)
        ->and(Venue::query()->where('external_id', 0)->exists())->toBeFalse()
        ->and(Fixture::query()->whereNotNull('venue_id')->count())->toBe(2);
});

function fixturePayloadWithVenue(
    int $fixtureId,
    int $leagueId,
    int $homeTeamId,
    int $awayTeamId,
    string $venueName,
    string $venueCity,
): array {
    return [
        'fixture' => [
            'id' => $fixtureId,
            'referee' => null,
            'date' => '2026-06-12T18:00:00+00:00',
            'venue' => [
                'id' => 0,
                'name' => $venueName,
                'city' => $venueCity,
            ],
            'status' => [
                'long' => 'Not Started',
                'elapsed' => null,
            ],
        ],
        'league' => [
            'id' => $leagueId,
            'season' => 2026,
            'round' => 'Regular Season - 1',
        ],
        'teams' => [
            'home' => ['id' => $homeTeamId],
            'away' => ['id' => $awayTeamId],
        ],
        'score' => [
            'halftime' => ['home' => null, 'away' => null],
            'fulltime' => ['home' => null, 'away' => null],
            'extratime' => ['home' => null, 'away' => null],
            'penalty' => ['home' => null, 'away' => null],
        ],
    ];
}
