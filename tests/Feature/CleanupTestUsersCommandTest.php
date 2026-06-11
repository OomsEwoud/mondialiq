<?php

use App\Enums\PredictionTypes;
use App\Models\FeedbackMessage;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use App\Models\Team;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

test('the cleanup test users command is a dry run by default', function () {
    $testUser = User::factory()->create([
        'email' => 'testuser698_1781191763899640000@test.be',
    ]);

    User::factory()->create([
        'email' => 'real@example.com',
    ]);

    $this->artisan('app:cleanup-test-users')
        ->expectsOutput('1 testusers gevonden met email LIKE %@test.be.')
        ->expectsOutput('DRY RUN - geen users verwijderd')
        ->assertSuccessful();

    expect($testUser->refresh())->toBeInstanceOf(User::class)
        ->and(User::query()->count())->toBe(2);
});

test('the cleanup test users command removes test users and related user data with force', function () {
    $testUser = User::factory()->create([
        'email' => 'testuser708_1781191764372158000@test.be',
    ]);
    $otherUser = User::factory()->create([
        'email' => 'support@example.com',
    ]);
    $fixture = createCleanupFixture();
    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $testUser->id,
        'source' => PredictionTypes::User->value,
        'winner_id' => null,
        'home_goals' => 1,
        'away_goals' => 1,
        'total_goals' => 2,
    ]);
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TESTLEAGUE',
        'owner_id' => $testUser->id,
    ]);

    $scoreboard->users()->attach($testUser->id, [
        'role' => 'member',
        'joined_at' => now(),
    ]);
    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
    ]);
    UserPreference::query()->create([
        'user_id' => $testUser->id,
    ]);
    FeedbackMessage::query()->create([
        'user_id' => $testUser->id,
        'handled_by' => $testUser->id,
        'category' => 'bug',
        'subject' => 'Test feedback',
        'message' => 'Clean me safely.',
    ]);
    DB::table('sessions')->insert([
        'id' => 'cleanup-test-session',
        'user_id' => $testUser->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'payload' => 'payload',
        'last_activity' => now()->timestamp,
    ]);
    DB::table('password_reset_tokens')->insert([
        'email' => $testUser->email,
        'token' => 'token',
        'created_at' => now(),
    ]);

    $this->artisan('app:cleanup-test-users --force')
        ->expectsOutput('1 testusers gevonden met email LIKE %@test.be.')
        ->expectsOutput('1 testusers verwijderd.')
        ->assertSuccessful();

    expect(User::query()->find($testUser->id))->toBeNull()
        ->and(User::query()->find($otherUser->id))->toBeInstanceOf(User::class)
        ->and(Prediction::query()->whereKey($prediction->id)->exists())->toBeFalse()
        ->and(ScoreboardPrediction::query()->where('prediction_id', $prediction->id)->exists())->toBeFalse()
        ->and(UserPreference::query()->where('user_id', $testUser->id)->exists())->toBeFalse()
        ->and(DB::table('users_has_scoreboards')->where('user_id', $testUser->id)->exists())->toBeFalse()
        ->and(DB::table('sessions')->where('user_id', $testUser->id)->exists())->toBeFalse()
        ->and(DB::table('password_reset_tokens')->where('email', $testUser->email)->exists())->toBeFalse()
        ->and($scoreboard->refresh()->owner_id)->toBeNull()
        ->and(FeedbackMessage::query()->where('user_id', $testUser->id)->exists())->toBeFalse()
        ->and(FeedbackMessage::query()->where('handled_by', $testUser->id)->exists())->toBeFalse();
});

test('the cleanup test users command never deletes admin users', function () {
    $admin = User::factory()->create([
        'email' => 'testuser999_1781191764372158000@test.be',
    ]);
    $testUser = User::factory()->create([
        'email' => 'testuser1000_1781191764372158000@test.be',
    ]);

    Role::query()->firstOrCreate([
        'name' => 'admin',
        'guard_name' => 'web',
    ]);
    $admin->assignRole('admin');

    $this->artisan('app:cleanup-test-users --force')
        ->expectsOutput('1 testusers gevonden met email LIKE %@test.be.')
        ->expectsOutput('1 testusers verwijderd.')
        ->assertSuccessful();

    expect(User::query()->find($admin->id))->toBeInstanceOf(User::class)
        ->and(User::query()->find($testUser->id))->toBeNull();
});

function createCleanupFixture(): Fixture
{
    $league = League::query()->create([
        'external_id' => 2026001,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);
    $homeTeam = Team::query()->create([
        'external_id' => 2026101,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);
    $awayTeam = Team::query()->create([
        'external_id' => 2026102,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    return Fixture::query()->create([
        'external_id' => 2026201,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);
}
