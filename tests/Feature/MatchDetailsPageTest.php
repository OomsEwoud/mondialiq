<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the match detail page exposes the fixture short status', function () {
    [$fixture] = createFixtureForMatchDetails();

    $fixture->update([
        'status_short' => 'HT',
        'status_long' => 'Halftime',
    ]);

    $response = $this->get(route('matches.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('match-details')
            ->where('match.statusShort', 'HT')
            ->where('match.status', 'Halftime'));
});

test('the match detail page exposes ai and current user prediction metadata', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam, $awayTeam] = createFixtureForMatchDetails();

    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::Ai->value,
        'home_chance' => 58,
        'draw_chance' => 24,
        'away_chance' => 18,
    ]);

    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $awayTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 2,
        'confidence' => 'high',
    ]);

    $response = $this->actingAs($user)->get(route('matches.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('match-details')
            ->where('match.hasAiPrediction', true)
            ->where('match.userPrediction.label', 'Away Team')
            ->where('match.userPrediction.homeScore', 1)
            ->where('match.userPrediction.awayScore', 2)
            ->where('match.userPrediction.confidence', 'high'));
});

test('the match detail page exposes sorted fixture events with api minutes and fallback player names', function () {
    [$fixture, $homeTeam, $awayTeam] = createFixtureForMatchDetails();

    FixtureEvent::query()->create([
        'fixture_id' => $fixture->id,
        'event_key' => FixtureEvent::buildEventKey($fixture->id, 45, 2, $awayTeam->id, 'Goal', 'Normal Goal'),
        'team_id' => $awayTeam->id,
        'team_name' => $awayTeam->name,
        'time_elapsed' => 45,
        'extra_time' => 2,
        'type' => 'Goal',
        'detail' => 'Normal Goal',
        'player_name' => 'Late Scorer',
    ]);

    FixtureEvent::query()->create([
        'fixture_id' => $fixture->id,
        'event_key' => FixtureEvent::buildEventKey($fixture->id, 4, null, $homeTeam->id, 'Goal', 'Normal Goal'),
        'team_id' => $homeTeam->id,
        'team_name' => $homeTeam->name,
        'time_elapsed' => 4,
        'extra_time' => null,
        'type' => 'Goal',
        'detail' => 'Normal Goal',
        'player_name' => 'I. Saibari',
    ]);

    FixtureEvent::query()->create([
        'fixture_id' => $fixture->id,
        'event_key' => FixtureEvent::buildEventKey($fixture->id, 45, null, $homeTeam->id, 'Card', 'Yellow Card'),
        'team_id' => $homeTeam->id,
        'team_name' => $homeTeam->name,
        'time_elapsed' => 45,
        'extra_time' => null,
        'type' => 'Card',
        'detail' => 'Yellow Card',
    ]);

    $response = $this->get(route('matches.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('match-details')
            ->where('match.events.0.minute', 4)
            ->where('match.events.0.extraTime', null)
            ->where('match.events.0.player', 'I. Saibari')
            ->where('match.events.1.minute', 45)
            ->where('match.events.1.extraTime', null)
            ->where('match.events.2.minute', 45)
            ->where('match.events.2.extraTime', 2)
            ->where('match.events.2.player', 'Late Scorer'));
});

test('the match detail page returns 404 for non world cup fixtures', function () {
    $otherLeague = League::query()->create([
        'external_id' => 9999,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 5001,
        'name' => 'Home Team',
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 5002,
        'name' => 'Away Team',
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => 5003,
        'league_id' => $otherLeague->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    $this->get(route('matches.show', $fixture))
        ->assertNotFound();
});

function createFixtureForMatchDetails(): array
{
    $league = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 19999),
        'name' => 'Home Team',
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(20000, 29999),
        'name' => 'Away Team',
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    return [$fixture, $homeTeam, $awayTeam];
}
