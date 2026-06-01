<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;

test('it previews the ai prediction prompt for a fixture', function () {
    $fixture = createPreviewAiPredictionPromptFixture();

    $this->artisan("app:preview-ai-prediction-prompt {$fixture->id}")
        ->expectsOutputToContain('You are an AI football prediction analyst for MondialIQ.')
        ->expectsOutputToContain('Context:')
        ->expectsOutputToContain('Prediction context:')
        ->assertSuccessful();
});

test('it fails when previewing a prompt for a missing fixture', function () {
    $this->artisan('app:preview-ai-prediction-prompt 999999')
        ->expectsOutput('Fixture 999999 niet gevonden.')
        ->assertFailed();
});

function createPreviewAiPredictionPromptFixture(): Fixture
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
