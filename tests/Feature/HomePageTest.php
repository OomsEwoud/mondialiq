<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
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
        'match_date' => now('Europe/Brussels')->addHour()->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 102,
        'match_date' => now('Europe/Brussels')->subMinute()->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 103,
        'match_date' => now('Europe/Brussels')->addMinutes(30)->format('Y-m-d H:i:s'),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    createHomeFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 104,
        'match_date' => now('Europe/Brussels')->addMinutes(45)->format('Y-m-d H:i:s'),
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
            ->where('upcomingFixtures.0.kickoffAt', $upcomingFixture->kickoffAt()));
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
        'match_date' => $overrides['match_date'] ?? now('Europe/Brussels')->addDay()->format('Y-m-d H:i:s'),
        'status_short' => $overrides['status_short'] ?? 'NS',
        'status_long' => $overrides['status_long'] ?? 'Not Started',
    ]);
}
