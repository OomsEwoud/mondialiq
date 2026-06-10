<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\Team;
use App\Models\User;
use App\Support\WorldCup\WorldCupContext;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);
});

it('keeps global predictions scoped globally and league predictions scoped to leagues', function () {
    $user = User::factory()->create();
    $scoreboardA = Scoreboard::factory()->create();
    $scoreboardB = Scoreboard::factory()->create();

    $scoreboardA->users()->attach($user, ['role' => 'member']);
    $scoreboardB->users()->attach($user, ['role' => 'member']);

    $homeTeam = \App\Models\Team::create([
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);
    $awayTeam = \App\Models\Team::create([
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 999,
        'league_id' => $this->league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addDays(2),
        'status_long' => 'Not Started',
    ]);

    // Create a global prediction
    $globalPrediction = Prediction::create([
        'user_id' => $user->id,
        'fixture_id' => $fixture->id,
        'scoreboard_id' => null,
        'winner_id' => $homeTeam->id,
        'home_goals' => 1,
        'away_goals' => 1,
        'source' => 'user',
    ]);

    // Create League A prediction
    $leagueAPrediction = Prediction::create([
        'user_id' => $user->id,
        'fixture_id' => $fixture->id,
        'scoreboard_id' => $scoreboardA->id,
        'winner_id' => $homeTeam->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'source' => 'user',
    ]);

    // Create League B prediction
    $leagueBPrediction = Prediction::create([
        'user_id' => $user->id,
        'fixture_id' => $fixture->id,
        'scoreboard_id' => $scoreboardB->id,
        'winner_id' => $awayTeam->id,
        'home_goals' => 0,
        'away_goals' => 3,
        'source' => 'user',
    ]);

    // Global predict page should show the global prediction
    actingAs($user)
        ->get(route('predictions', ['mode' => 'mine']))
        ->assertOk()
        ->assertSee('View prediction'); // Global

    // League A predict page should show League A prediction
    actingAs($user)
        ->get(route('leagues.predict', $scoreboardA))
        ->assertOk()
        ->assertSee('Edit prediction'); // League A

    // League B predict page should show League B prediction
    actingAs($user)
        ->get(route('leagues.predict', $scoreboardB))
        ->assertOk()
        ->assertSee('Edit prediction'); // League B
});

it('does not leak global predictions into leagues', function () {
    $user = User::factory()->create();
    $scoreboard = Scoreboard::factory()->create();
    $scoreboard->users()->attach($user, ['role' => 'member']);

    $homeTeam = \App\Models\Team::create([
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);
    $awayTeam = \App\Models\Team::create([
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 998,
        'league_id' => $this->league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addDays(2),
        'status_long' => 'Not Started',
    ]);

    // Global prediction exists, NO league prediction
    Prediction::create([
        'user_id' => $user->id,
        'fixture_id' => $fixture->id,
        'scoreboard_id' => null,
        'winner_id' => $homeTeam->id,
        'home_goals' => 1,
        'away_goals' => 1,
        'source' => 'user',
    ]);

    actingAs($user)
        ->get(route('leagues.predict', $scoreboard))
        ->assertOk()
        ->assertDontSee('Edit prediction')
        ->assertSee('Predict'); // Should not show "Edit prediction" because league prediction doesn't exist
});
