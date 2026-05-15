<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('an ai prediction can be shown on the predictions page', function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::Ai->value,
        'advice' => 'Belgium or draw',
        'home_chance' => 55,
        'draw_chance' => 25,
        'away_chance' => 20,
    ]);

    $response = $this->get(route('predictions', ['mode' => 'ai']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'ai')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $fixture->id)
            ->where('fixtures.data.0.homeTeam', 'Belgium')
            ->where('fixtures.data.0.awayTeam', 'Netherlands')
            ->where('fixtures.data.0.prediction.homeWin', 55)
            ->where('fixtures.data.0.prediction.draw', 25)
            ->where('fixtures.data.0.prediction.awayWin', 20),
        );
});
