<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;

function createVisibilityFixture(string $matchDate = '2026-06-12 20:00:00'): Fixture
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
        'match_date' => $matchDate,
        'status_long' => 'Not Started',
    ]);
}

test('new prediction uses default visibility from user preference', function () {
    $user = User::factory()->create();
    $user->userPreference()->update([
        'default_prediction_visibility' => 'private',
    ]);
    $fixture = createVisibilityFixture();

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('predictions', [
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'visibility' => 'private',
    ]);
});

test('private prediction is not visible to other users', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $fixture = createVisibilityFixture();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'outcome' => 'home',
    ]);

    $visible = Prediction::query()
        ->visibleFor($viewer)
        ->where('user_id', $owner->id)
        ->exists();

    expect($visible)->toBeFalse();
});

test('public prediction is visible to other users', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $fixture = createVisibilityFixture();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'outcome' => 'home',
    ]);

    $visible = Prediction::query()
        ->visibleFor($viewer)
        ->where('user_id', $owner->id)
        ->exists();

    expect($visible)->toBeTrue();
});

test('private prediction is visible to its owner', function () {
    $owner = User::factory()->create();
    $fixture = createVisibilityFixture();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'outcome' => 'home',
    ]);

    $visible = Prediction::query()
        ->visibleFor($owner)
        ->where('user_id', $owner->id)
        ->exists();

    expect($visible)->toBeTrue();
});

test('prediction without visibility is treated as public', function () {
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $fixture = createVisibilityFixture();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => null,
        'outcome' => 'home',
    ]);

    $visible = Prediction::query()
        ->visibleFor($viewer)
        ->where('user_id', $owner->id)
        ->exists();

    expect($visible)->toBeTrue();
});

test('isVisibleTo returns true for owner of private prediction', function () {
    $owner = User::factory()->create();
    $fixture = createVisibilityFixture();

    $prediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'outcome' => 'home',
    ]);

    expect($prediction->isVisibleTo($owner))->toBeTrue();
    expect($prediction->isVisibleTo(null))->toBeFalse();
});
