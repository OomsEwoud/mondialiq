<?php

use App\Enums\PredictionTypes;
use App\Models\Country;
use App\Models\Fixture;
use App\Models\League;
use App\Models\MissingPlayer;
use App\Models\Player;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the match detail page exposes missing players grouped by team', function () {
    [$fixture, $homeTeam, $awayTeam] = createFixtureForMatchDetails();
    $country = Country::query()->create([
        'name' => 'England',
        'fifa_code' => 'ENG',
    ]);

    $homePlayer = createMatchDetailsMissingPlayer('Home Player', $homeTeam, [
        'country_id' => $country->id,
        'photo_url' => 'https://example.com/home-player.png',
        'position' => 'M',
        'number' => 8,
    ]);
    $awayPlayer = createMatchDetailsMissingPlayer('Away Player', $awayTeam, [
        'position' => 'F',
        'number' => 9,
    ]);

    createMatchDetailsMissingPlayerRow($fixture, $homePlayer, 'Missing Fixture', 'Knee injury');
    createMatchDetailsMissingPlayerRow($fixture, $awayPlayer, 'Questionable', null);

    $response = $this->get(route('matches.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('match-details')
            ->where('match.availability.home.0.id', $homePlayer->id)
            ->where('match.availability.home.0.name', 'Home Player')
            ->where('match.availability.home.0.photo', 'https://example.com/home-player.png')
            ->where('match.availability.home.0.number', 8)
            ->where('match.availability.home.0.position', 'M')
            ->where('match.availability.home.0.country', 'England')
            ->where('match.availability.home.0.type', 'Missing Fixture')
            ->where('match.availability.home.0.reason', 'Knee injury')
            ->where('match.availability.away.0.id', $awayPlayer->id)
            ->where('match.availability.away.0.name', 'Away Player')
            ->where('match.availability.away.0.type', 'Questionable')
            ->where('match.availability.away.0.reason', null));
});

test('the match detail page exposes empty availability when no players are missing', function () {
    [$fixture] = createFixtureForMatchDetails();

    $response = $this->get(route('matches.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('match-details')
            ->where('match.availability.home', [])
            ->where('match.availability.away', []));
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

function createMatchDetailsMissingPlayerRow(
    Fixture $fixture,
    Player $player,
    ?string $type = null,
    ?string $reason = null,
): MissingPlayer {
    return MissingPlayer::query()->create([
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => $type,
        'reason' => $reason,
    ]);
}

function createMatchDetailsMissingPlayer(
    string $name,
    Team $team,
    array $overrides = [],
): Player {
    $player = Player::query()->create(array_merge([
        'external_id' => fake()->unique()->numberBetween(10000, 999999),
        'display_name' => $name,
    ], $overrides));

    $player->teams()->attach($team->id, ['is_active' => true]);

    return $player;
}

function createFixtureForMatchDetails(): array
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
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
