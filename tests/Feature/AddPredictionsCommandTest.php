<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Prediction\PredictionService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the add predictions command only syncs relevant fixtures', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4101,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4102,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $soonFixture = Fixture::create([
        'external_id' => 501,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 502,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subDay(),
        'status_long' => 'First Half',
    ]);

    Fixture::create([
        'external_id' => 503,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('getFixturePrediction')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixturePrediction')->once()->with($soonFixture->external_id)->andReturn([]);
    });

    $this->mock(PredictionService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeApiPrediction')->once()->with([], $liveFixture->id);
        $mock->shouldReceive('storeApiPrediction')->once()->with([], $soonFixture->id);
    });

    $this->artisan('app:add-predictions')
        ->expectsOutput('Starten met ophalen van voorspellingen')
        ->expectsOutput('2 relevante fixtures gevonden.')
        ->expectsOutput('Alle voorspellingen zijn geupdate')
        ->assertSuccessful();
});

test('the add predictions command returns early when no relevant fixtures are found', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4201,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4202,
        'name' => 'Germany',
        'code' => 'GER',
        'logo_url' => 'https://example.com/germany.png',
    ]);

    Fixture::create([
        'external_id' => 504,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixturePrediction');
    });

    $this->mock(PredictionService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeApiPrediction'));

    $this->artisan('app:add-predictions')
        ->expectsOutput('Starten met ophalen van voorspellingen')
        ->expectsOutput('Geen relevante fixtures gevonden voor voorspellingen sync.')
        ->assertSuccessful();
});
