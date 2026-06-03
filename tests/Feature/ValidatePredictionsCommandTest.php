<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Carbon;

afterEach(fn () => Carbon::setTestNow());

test('it validates unscored predictions for finished fixtures with a final score', function () {
    Carbon::setTestNow('2026-06-12 22:00:00');

    [$fixture, $homeTeam] = createValidationFixture([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);

    $prediction = createValidationPrediction($fixture, [
        'winner_id' => $homeTeam->id,
        'home_goals' => 3,
        'away_goals' => 1,
        'total_goals' => 4,
    ]);

    $this->artisan('predictions:validate')
        ->expectsOutput('Valideren van user predictions voor afgewerkte fixtures')
        ->expectsOutput('1 afgewerkte fixtures met open predictions gevonden.')
        ->expectsOutput("Fixture {$fixture->id}: 1 predictions gevalideerd, 0 overgeslagen.")
        ->expectsOutput('1 predictions gevalideerd.')
        ->expectsOutput('0 predictions overgeslagen.')
        ->expectsOutput('0 fouten.')
        ->assertSuccessful();

    expect($prediction->refresh()->points)->toBe(11)
        ->and($prediction->points_awarded_at?->toDateTimeString())->toBe('2026-06-12 22:00:00');
});

test('it does not validate predictions for fixtures that are not finished', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    [$fixture, $homeTeam] = createValidationFixture([
        'status_short' => '2H',
        'status_long' => 'Second Half',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);

    $prediction = createValidationPrediction($fixture, [
        'winner_id' => $homeTeam->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $this->artisan('predictions:validate')
        ->expectsOutput('0 afgewerkte fixtures met open predictions gevonden.')
        ->assertSuccessful();

    expect($prediction->refresh()->points)->toBe(0)
        ->and($prediction->points_awarded_at)->toBeNull();
});

test('it is idempotent when the command runs more than once', function () {
    Carbon::setTestNow('2026-06-12 22:00:00');

    [$fixture, $homeTeam] = createValidationFixture([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);

    $prediction = createValidationPrediction($fixture, [
        'winner_id' => $homeTeam->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $this->artisan('predictions:validate')->assertSuccessful();

    $prediction->refresh();
    $firstPointsAwardedAt = $prediction->points_awarded_at?->toDateTimeString();

    Carbon::setTestNow('2026-06-13 02:00:00');

    $this->artisan('predictions:validate')
        ->expectsOutput('0 afgewerkte fixtures met open predictions gevonden.')
        ->assertSuccessful();

    expect($prediction->refresh()->points)->toBe(20)
        ->and($prediction->points_awarded_at?->toDateTimeString())->toBe($firstPointsAwardedAt);
});

test('it marks scoreless predictions as awarded with zero points', function () {
    Carbon::setTestNow('2026-06-12 22:00:00');

    [$fixture, $homeTeam] = createValidationFixture([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);

    $prediction = createValidationPrediction($fixture, [
        'winner_id' => $homeTeam->id,
        'home_goals' => null,
        'away_goals' => null,
        'total_goals' => null,
    ]);

    $this->artisan('predictions:validate')
        ->expectsOutput("Fixture {$fixture->id}: 0 predictions gevalideerd, 1 overgeslagen.")
        ->expectsOutput('0 predictions gevalideerd.')
        ->expectsOutput('1 predictions overgeslagen.')
        ->assertSuccessful();

    expect($prediction->refresh()->points)->toBe(0)
        ->and($prediction->points_awarded_at?->toDateTimeString())->toBe('2026-06-12 22:00:00');
});

test('it skips finished fixtures without a final score', function () {
    Carbon::setTestNow('2026-06-12 22:00:00');

    [$fixture, $homeTeam] = createValidationFixture([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => null,
        'fulltime_away_goals' => null,
    ]);

    $prediction = createValidationPrediction($fixture, [
        'winner_id' => $homeTeam->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $this->artisan('predictions:validate')
        ->expectsOutput('1 afgewerkte fixtures met open predictions gevonden.')
        ->expectsOutput("Fixture {$fixture->id} overgeslagen: finale score ontbreekt.")
        ->expectsOutput('0 predictions gevalideerd.')
        ->expectsOutput('1 predictions overgeslagen.')
        ->assertSuccessful();

    expect($prediction->refresh()->points)->toBe(0)
        ->and($prediction->points_awarded_at)->toBeNull();
});

function createValidationFixture(array $overrides = []): array
{
    $league = League::query()->create([
        'external_id' => random_int(1000, 9999),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => random_int(10000, 19999),
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => random_int(20000, 29999),
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => random_int(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => now()->subHours(2),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
        ...$overrides,
    ]);

    return [$fixture, $homeTeam, $awayTeam];
}

function createValidationPrediction(Fixture $fixture, array $overrides = []): Prediction
{
    return Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => User::factory()->create()->id,
        'source' => PredictionTypes::User->value,
        'winner_id' => null,
        'home_goals' => 1,
        'away_goals' => 1,
        'total_goals' => 2,
        ...$overrides,
    ]);
}
