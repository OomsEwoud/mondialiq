<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;

test('it shows the prediction context prompt block for a fixture', function () {
    $fixture = createShowPredictionContextFixture();

    $this->artisan("app:show-prediction-context {$fixture->id}")
        ->expectsOutputToContain('Prediction context:')
        ->expectsOutputToContain('Fixture:')
        ->expectsOutputToContain('- Belgium vs Netherlands')
        ->assertSuccessful();
});

test('it shows the prediction context as json', function () {
    $fixture = createShowPredictionContextFixture();

    $this->artisan("app:show-prediction-context {$fixture->id} --json")
        ->expectsOutputToContain('"home_team": "Belgium"')
        ->expectsOutputToContain('"away_team": "Netherlands"')
        ->assertSuccessful();
});

test('it fails when the fixture does not exist', function () {
    $this->artisan('app:show-prediction-context 999999')
        ->expectsOutput('Fixture 999999 niet gevonden.')
        ->assertFailed();
});

function createShowPredictionContextFixture(): Fixture
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 19999),
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(20000, 29999),
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    return Fixture::query()->create([
        'external_id' => fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => '2026-06-12 18:00:00',
        'status_long' => 'Not Started',
    ]);
}
