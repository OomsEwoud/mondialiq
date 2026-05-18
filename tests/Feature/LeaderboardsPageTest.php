<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createLeaderboardFixture(): Fixture
{
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

    return Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Finished',
    ]);
}

test('guest users are redirected from the leaderboards page', function () {
    $this->get(route('leaderboards'))->assertRedirect(route('login'));
});

test('the leaderboards page shows the top 10 and current user standing', function () {
    $fixture = createLeaderboardFixture();

    $users = User::factory()->count(12)->create();
    $currentUser = $users->last();

    $users->each(function (User $user, int $index) use ($fixture) {
        Prediction::create([
            'fixture_id' => $fixture->id,
            'user_id' => $user->id,
            'source' => PredictionTypes::User->value,
            'points' => 120 - ($index * 10),
        ]);
    });

    $response = $this
        ->actingAs($currentUser)
        ->get(route('leaderboards'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('globalLeaders', 10)
            ->where('globalLeaders.0.rank', 1)
            ->where('globalLeaders.0.id', $users->first()->id)
            ->where('globalLeaders.0.totalPoints', 120)
            ->where('globalLeaders.9.rank', 10)
            ->where('globalLeaders.9.id', $users->get(9)->id)
            ->where('currentUserStanding.id', $currentUser->id)
            ->where('currentUserStanding.rank', 12)
            ->where('currentUserStanding.totalPoints', 10)
            ->where('totalPlayers', 12),
        );
});
