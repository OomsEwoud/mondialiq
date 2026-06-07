<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\AiUserSeeder;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;

function createAiFixture(): Fixture
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

    return Fixture::query()->create([
        'external_id' => random_int(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage',
        'season' => 2026,
        'match_date' => '2026-06-12 20:00:00',
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);
}

test('ai user seeder is idempotent and marks user as system user', function () {
    $seeder = new AiUserSeeder;
    $seeder->run();

    $aiUser = User::where('email', 'ai@mondialiq.local')->first();

    expect($aiUser)->not->toBeNull()
        ->and($aiUser->is_system_user)->toBeTrue()
        ->and($aiUser->name)->toBe('MondialiQ AI');

    $seeder->run();

    expect(User::where('email', 'ai@mondialiq.local')->count())->toBe(1);
});

test('fortify login rejects system user', function () {
    $aiUser = User::create([
        'name' => 'Test AI',
        'email' => 'test-ai@example.com',
        'password' => Hash::make('password'),
        'is_system_user' => true,
    ]);

    $response = $this->post(route('login.store'), [
        'email' => $aiUser->email,
        'password' => 'password',
    ]);

    $response->assertRedirect();
    $this->assertGuest();
});

test('socialite callback rejects system user', function () {
    $aiUser = User::create([
        'name' => 'Test AI',
        'email' => 'test-ai-social@example.com',
        'password' => null,
        'is_system_user' => true,
        'social_provider' => 'google',
        'social_provider_id' => '12345',
    ]);

    $socialiteUser = Mockery::mock(Laravel\Socialite\Contracts\User::class);
    $socialiteUser->shouldReceive('getEmail')->andReturn($aiUser->email);
    $socialiteUser->shouldReceive('getId')->andReturn('12345');
    $socialiteUser->shouldReceive('getName')->andReturn('Test AI');
    $socialiteUser->shouldReceive('getNickname')->andReturn(null);
    $socialiteUser->shouldReceive('getAvatar')->andReturn(null);

    Socialite::shouldReceive('driver')->with('google')->andReturn(
        Mockery::mock(Provider::class)
            ->shouldReceive('user')->andReturn($socialiteUser)
            ->getMock()
    );

    $response = $this->get(route('auth.callback', [
        'provider' => 'google',
        'code' => 'valid-code',
        'state' => 'test-state',
    ]));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('owner can add ai participant to scoreboard', function () {
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Test League',
        'code' => 'AITEST1',
        'owner_id' => $owner->id,
    ]);
    $scoreboard->users()->attach($owner->id);

    $seeder = new AiUserSeeder;
    $seeder->run();

    $this
        ->actingAs($owner)
        ->post(route('leagues.ai-participant.store', $scoreboard))
        ->assertRedirect(route('leagues.members', $scoreboard));

    $aiUser = User::aiUser();
    expect($scoreboard->users()->whereKey($aiUser->id)->exists())->toBeTrue();
});

test('owner can remove ai participant from scoreboard', function () {
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Test League',
        'code' => 'AITEST2',
        'owner_id' => $owner->id,
    ]);
    $scoreboard->users()->attach($owner->id);

    $seeder = new AiUserSeeder;
    $seeder->run();

    $aiUser = User::aiUser();
    $scoreboard->users()->attach($aiUser->id);

    $this
        ->actingAs($owner)
        ->delete(route('leagues.ai-participant.destroy', $scoreboard))
        ->assertRedirect(route('leagues.members', $scoreboard));

    expect($scoreboard->users()->whereKey($aiUser->id)->exists())->toBeFalse();
});

test('non owner cannot add ai participant', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Test League',
        'code' => 'AITEST3',
        'owner_id' => $owner->id,
    ]);
    $scoreboard->users()->attach([$owner->id, $member->id]);

    $seeder = new AiUserSeeder;
    $seeder->run();

    $this
        ->actingAs($member)
        ->post(route('leagues.ai-participant.store', $scoreboard))
        ->assertForbidden();
});

test('ai predictions are scored and synced to scoreboards', function () {
    $fixture = createAiFixture();

    $seeder = new AiUserSeeder;
    $seeder->run();
    $aiUser = User::aiUser();

    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Score League',
        'code' => 'AISCORE1',
    ]);
    $scoreboard->users()->attach($aiUser->id);

    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $aiUser->id,
        'source' => PredictionTypes::Ai->value,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $prediction->forceFill([
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ])->save();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction)->not->toBeNull()
        ->and($scoreboardPrediction->points)->toBe(20)
        ->and($scoreboardPrediction->is_boosted)->toBeFalse();
});

test('ai predictions do not receive boosted bonuses', function () {
    $fixture = createAiFixture();

    $seeder = new AiUserSeeder;
    $seeder->run();
    $aiUser = User::aiUser();

    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Boost League',
        'code' => 'AIBOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 70,
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $scoreboard->users()->attach($aiUser->id);

    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $aiUser->id,
        'source' => PredictionTypes::Ai->value,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
        'confidence' => 'high',
    ]);

    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => true,
    ]);

    $prediction->forceFill([
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ])->save();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction->points)->toBe(10); // exact 10, no boost bonus for AI
});

test('ai user appears in league members with system user flag', function () {
    $fixture = createAiFixture();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'AI Member League',
        'code' => 'AIMEM1',
        'owner_id' => $owner->id,
    ]);
    $scoreboard->users()->attach($owner->id);

    $seeder = new AiUserSeeder;
    $seeder->run();
    $aiUser = User::aiUser();
    $scoreboard->users()->attach($aiUser->id);

    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $aiUser->id,
        'source' => PredictionTypes::Ai->value,
        'points' => 10,
        'points_awarded_at' => now('UTC'),
    ]);

    $response = $this
        ->actingAs($owner)
        ->get(route('leagues.members', $scoreboard));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('members', 2)
            ->where('members.0.isSystemUser', true)
            ->where('members.1.isSystemUser', false)
        );
});

test('ai user is included in global leaderboard', function () {
    $fixture = createAiFixture();

    $user = User::factory()->create();
    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
        'points_awarded_at' => now('UTC'),
    ]);

    $seeder = new AiUserSeeder;
    $seeder->run();
    $aiUser = User::aiUser();
    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $aiUser->id,
        'source' => PredictionTypes::Ai->value,
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('leaderboards'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('totalPlayers', 2)
            ->has('globalLeaderboard', 2)
            ->where('globalLeaderboard.0.id', $aiUser->id)
            ->where('globalLeaderboard.0.isSystemUser', true)
            ->where('globalLeaderboard.1.id', $user->id)
            ->where('globalLeaderboard.1.isSystemUser', false)
        );
});
