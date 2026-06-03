<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
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

test('it scores user predictions when fulltime fixture scores are synced', function () {
    $user = User::factory()->create();
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
            venueName: 'Estadio Municipal',
            venueCity: 'Madrid',
        ),
    ]);

    $fixture = Fixture::query()->firstOrFail();

    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 3,
        'away_goals' => 1,
        'total_goals' => 4,
        'confidence' => 'high',
    ]);

    $payload = fixturePayloadWithVenue(
        fixtureId: 1001,
        leagueId: $league->external_id,
        homeTeamId: $homeTeam->external_id,
        awayTeamId: $awayTeam->external_id,
        venueName: 'Estadio Municipal',
        venueCity: 'Madrid',
    );
    $payload['score']['fulltime'] = ['home' => 2, 'away' => 1];

    app(FixtureService::class)->storeFixtures([$payload]);

    expect($prediction->refresh()->points)->toBe(11);
});

test('it stores fixture live status short and elapsed time from the api payload', function () {
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

    $payload = fixturePayloadWithVenue(
        fixtureId: 1001,
        leagueId: $league->external_id,
        homeTeamId: $homeTeam->external_id,
        awayTeamId: $awayTeam->external_id,
        venueName: 'Estadio Municipal',
        venueCity: 'Madrid',
    );
    $payload['fixture']['status']['short'] = '2H';
    $payload['fixture']['status']['long'] = 'Second Half';
    $payload['fixture']['status']['elapsed'] = 70;

    app(FixtureService::class)->storeFixtures([$payload]);

    $fixture = Fixture::query()->firstOrFail();

    expect($fixture->status_short)->toBe('2H')
        ->and($fixture->status_long)->toBe('Second Half')
        ->and($fixture->elapsed_time)->toBe(70);
});

test('it stores live fixture goals as the current fulltime score fields', function () {
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

    $payload = fixturePayloadWithVenue(
        fixtureId: 1001,
        leagueId: $league->external_id,
        homeTeamId: $homeTeam->external_id,
        awayTeamId: $awayTeam->external_id,
        venueName: 'Estadio Municipal',
        venueCity: 'Madrid',
    );
    $payload['fixture']['status']['short'] = '2H';
    $payload['fixture']['status']['long'] = 'Second Half';
    $payload['fixture']['status']['elapsed'] = 62;
    $payload['goals'] = ['home' => 1, 'away' => 0];

    app(FixtureService::class)->storeFixtures([$payload]);

    $fixture = Fixture::query()->firstOrFail();

    expect($fixture->fulltime_home_goals)->toBe(1)
        ->and($fixture->fulltime_away_goals)->toBe(0)
        ->and($fixture->elapsed_time)->toBe(62);
});

test('it allows a fixture to transition from live to full time on a later sync', function () {
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

    $livePayload = fixturePayloadWithVenue(
        fixtureId: 1001,
        leagueId: $league->external_id,
        homeTeamId: $homeTeam->external_id,
        awayTeamId: $awayTeam->external_id,
        venueName: 'Estadio Municipal',
        venueCity: 'Madrid',
    );
    $livePayload['fixture']['status']['short'] = '2H';
    $livePayload['fixture']['status']['long'] = 'Second Half';
    $livePayload['fixture']['status']['elapsed'] = 70;

    app(FixtureService::class)->storeFixtures([$livePayload]);

    $finishedPayload = fixturePayloadWithVenue(
        fixtureId: 1001,
        leagueId: $league->external_id,
        homeTeamId: $homeTeam->external_id,
        awayTeamId: $awayTeam->external_id,
        venueName: 'Estadio Municipal',
        venueCity: 'Madrid',
    );
    $finishedPayload['fixture']['status']['short'] = 'FT';
    $finishedPayload['fixture']['status']['long'] = 'Match Finished';
    $finishedPayload['fixture']['status']['elapsed'] = 90;
    $finishedPayload['score']['fulltime'] = ['home' => 2, 'away' => 1];

    app(FixtureService::class)->storeFixtures([$finishedPayload]);

    $fixture = Fixture::query()->firstOrFail();

    expect($fixture->status_short)->toBe('FT')
        ->and($fixture->status_long)->toBe('Match Finished')
        ->and($fixture->elapsed_time)->toBe(90)
        ->and($fixture->fulltime_home_goals)->toBe(2)
        ->and($fixture->fulltime_away_goals)->toBe(1);
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
                'short' => 'NS',
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
