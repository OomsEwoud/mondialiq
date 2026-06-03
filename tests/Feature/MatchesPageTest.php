<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the matches page exposes ai and user prediction statuses', function () {
    $user = User::factory()->create();

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
        'home_chance' => 55,
        'draw_chance' => 25,
        'away_chance' => 20,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $awayTeam->id,
        'source' => PredictionTypes::User->value,
    ]);

    $response = $this->actingAs($user)->get(route('matches'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('matches')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $fixture->id)
            ->where('fixtures.data.0.hasAiPrediction', true)
            ->where('fixtures.data.0.userPrediction.label', 'Netherlands')
            ->where('fixtures.data.0.prediction.homeWin', 55)
        );
});

test('the matches page separates live fixtures from upcoming fixtures', function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'name' => 'Croatia U21',
        'code' => 'CRO',
        'logo_url' => 'https://example.com/croatia.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'Qatar U20',
        'code' => 'QAT',
        'logo_url' => 'https://example.com/qatar.png',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 20,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Friendly International',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subHour()->format('Y-m-d H:i:s'),
        'status_short' => '2H',
        'status_long' => 'Second Half',
        'elapsed_time' => 62,
    ]);

    $upcomingFixture = Fixture::create([
        'external_id' => 21,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Friendly International',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->addHour()->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $this->get(route('matches', ['status' => 'live']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('matches')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $liveFixture->id)
        );

    $this->get(route('matches', ['status' => 'upcoming']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('matches')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $upcomingFixture->id)
        );
});
