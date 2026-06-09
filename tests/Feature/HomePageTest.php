<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page only shows future not started upcoming fixtures', function () {
    $league = League::query()->create([
        'external_id' => 1,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 1001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 1002,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $upcomingFixture = createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 101,
        'match_date' => now('UTC')->addHour()->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
        'has_lineups' => true,
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 102,
        'match_date' => now('UTC')->subMinute()->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 103,
        'match_date' => now('UTC')->addMinutes(30)->format('Y-m-d H:i:s'),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 104,
        'match_date' => now('UTC')->addMinutes(45)->format('Y-m-d H:i:s'),
        'status_short' => 'CANC',
        'status_long' => 'Match Cancelled',
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('upcomingFixtures', 1)
            ->where('upcomingFixtures.0.id', $upcomingFixture->id)
            ->where('upcomingFixtures.0.statusShort', 'NS')
            ->where('upcomingFixtures.0.statusLong', 'Not Started')
            ->where('upcomingFixtures.0.hasLineups', true)
            ->where('upcomingFixtures.0.predictionState', null)
            ->where('upcomingFixtures.0.kickoffAt', $upcomingFixture->kickoffAt()));
});

test('the home page marks upcoming matches as predicted or missing for the current user', function () {
    $user = User::factory()->create();
    $league = League::query()->create([
        'external_id' => 1,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 1001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 1002,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $predictedFixture = createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 201,
        'match_date' => now('UTC')->addHour()->format('Y-m-d H:i:s'),
    ]);
    $missingFixture = createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 202,
        'match_date' => now('UTC')->addHours(2)->format('Y-m-d H:i:s'),
    ]);

    Prediction::query()->create([
        'fixture_id' => $predictedFixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'winner_id' => $homeTeam->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $this->actingAs($user)
        ->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('upcomingFixtures', 2)
            ->where('upcomingFixtures.0.id', $predictedFixture->id)
            ->where('upcomingFixtures.0.predictionState', 'predicted')
            ->where('upcomingFixtures.1.id', $missingFixture->id)
            ->where('upcomingFixtures.1.predictionState', 'missing'));
});

test('the home page excludes non world cup upcoming fixtures', function () {
    $worldCupLeague = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $otherLeague = League::query()->create([
        'external_id' => 9999,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 3001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 3002,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $worldCupFixture = createHomeFixture($worldCupLeague, $homeTeam, $awayTeam, [
        'external_id' => 301,
        'match_date' => now('UTC')->addHour()->format('Y-m-d H:i:s'),
    ]);

    createHomeFixture($otherLeague, $homeTeam, $awayTeam, [
        'external_id' => 302,
        'match_date' => now('UTC')->addMinutes(30)->format('Y-m-d H:i:s'),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('upcomingFixtures', 1)
            ->where('upcomingFixtures.0.id', $worldCupFixture->id));
});

function createHomeFixture(League $league, Team $homeTeam, Team $awayTeam, array $overrides = []): Fixture
{
    return Fixture::query()->create([
        'external_id' => $overrides['external_id'] ?? 1001,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay()->format('Y-m-d H:i:s'),
        'status_short' => $overrides['status_short'] ?? 'NS',
        'status_long' => $overrides['status_long'] ?? 'Not Started',
        'has_lineups' => $overrides['has_lineups'] ?? false,
    ]);
}
