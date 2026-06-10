<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use App\Models\Team;
use App\Models\User;
use App\Services\Prediction\PredictionScoreService;

function createScoringFixture(array $overrides = []): Fixture
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
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => '2026-06-12 20:00:00',
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
        ...$overrides,
    ]);
}

function createScoringPrediction(Fixture $fixture, array $overrides = []): Prediction
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

test('a scoreboard has default scoring rules', function () {
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TEST123',
    ]);

    expect($scoreboard->scoringRule('exact_score_points'))->toBe(10)
        ->and($scoreboard->scoringRule('correct_result_points'))->toBe(5)
        ->and($scoreboard->scoringRule('correct_goal_difference_points'))->toBe(3)
        ->and($scoreboard->scoringRule('correct_home_goals_points'))->toBe(1)
        ->and($scoreboard->scoringRule('correct_away_goals_points'))->toBe(1)
        ->and($scoreboard->scoringRule('boosted_predictions_enabled'))->toBe(false)
        ->and($scoreboard->scoringRule('boosted_predictions_limit'))->toBe(3)
        ->and($scoreboard->scoringRule('boosted_confidence_threshold'))->toBe('low')
        ->and($scoreboard->scoringRule('boosted_prediction_bonus_points'))->toBe(2);
});

test('an owner can update scoring rules', function () {
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TEST123',
        'owner_id' => $owner->id,
    ]);

    $this
        ->actingAs($owner)
        ->patch(route('leagues.update', $scoreboard), [
            'name' => 'Test League',
            'description' => null,
            'visibility' => 'private',
            'is_active' => true,
            'icon' => '⚡',
            'accent_color' => 'cyan',
            'scoring_rules' => [
                'exact_score_points' => 15,
                'correct_result_points' => 7,
                'correct_goal_difference_points' => 4,
                'correct_home_goals_points' => 2,
                'correct_away_goals_points' => 2,
                'boosted_predictions_enabled' => false,
                'boosted_predictions_limit' => 3,
                'boosted_confidence_threshold' => 'medium',
                'boosted_prediction_bonus_points' => 2,
            ],
        ])
        ->assertRedirect();

    $scoreboard->refresh();

    expect($scoreboard->scoringRule('exact_score_points'))->toBe(15)
        ->and($scoreboard->scoringRule('correct_result_points'))->toBe(7);
});

test('an owner can update boosted prediction settings', function () {
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TEST123',
        'owner_id' => $owner->id,
    ]);

    $this
        ->actingAs($owner)
        ->patch(route('leagues.update', $scoreboard), [
            'name' => 'Test League',
            'description' => null,
            'visibility' => 'private',
            'is_active' => true,
            'icon' => '⚡',
            'accent_color' => 'cyan',
            'scoring_rules' => [
                'exact_score_points' => 10,
                'correct_result_points' => 5,
                'correct_goal_difference_points' => 3,
                'correct_home_goals_points' => 1,
                'correct_away_goals_points' => 1,
                'boosted_predictions_enabled' => true,
                'boosted_predictions_limit' => 5,
                'boosted_confidence_threshold' => 'high',
                'boosted_prediction_bonus_points' => 3,
            ],
        ])
        ->assertRedirect();

    $scoreboard->refresh();

    expect($scoreboard->scoringRule('boosted_predictions_enabled'))->toBe(true)
        ->and($scoreboard->scoringRule('boosted_predictions_limit'))->toBe(5)
        ->and($scoreboard->scoringRule('boosted_confidence_threshold'))->toBe('high')
        ->and($scoreboard->scoringRule('boosted_prediction_bonus_points'))->toBe(3);
});

test('a normal member cannot update scoring or boosted settings', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TEST123',
        'owner_id' => $owner->id,
    ]);
    $scoreboard->users()->attach($member->id);

    $this
        ->actingAs($member)
        ->patch(route('leagues.update', $scoreboard), [
            'name' => 'Test League',
            'description' => null,
            'visibility' => 'private',
            'is_active' => true,
            'icon' => '⚡',
            'accent_color' => 'cyan',
            'scoring_rules' => [
                'exact_score_points' => 99,
                'correct_result_points' => 5,
                'correct_goal_difference_points' => 3,
                'correct_home_goals_points' => 1,
                'correct_away_goals_points' => 1,
                'boosted_predictions_enabled' => true,
                'boosted_predictions_limit' => 3,
                'boosted_confidence_threshold' => 'medium',
                'boosted_prediction_bonus_points' => 2,
            ],
        ])
        ->assertForbidden();
});

test('leaderboard points use custom group scoring rules', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Custom League',
        'code' => 'CUSTOM1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
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
        ->and($scoreboardPrediction->points)->toBe(10);
});

test('fallback scoring works for groups without custom rules', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Default League',
        'code' => 'DEFAULT1',
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
        'home_goals' => 2,
        'away_goals' => 0,
        'total_goals' => 2,
    ]);

    $prediction->forceFill([
        'points' => 11,
        'points_awarded_at' => now('UTC'),
    ])->save();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction)->not->toBeNull()
        ->and($scoreboardPrediction->points)->toBe(11);
});

test('boosted predictions can be enabled and disabled per leaderboard', function () {
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Test League',
        'code' => 'TEST123',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 2,
        ],
    ]);

    expect($scoreboard->scoringRule('boosted_predictions_enabled'))->toBe(true);

    $scoreboard->update([
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => false,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 2,
        ],
    ]);

    expect($scoreboard->fresh()->scoringRule('boosted_predictions_enabled'))->toBe(false);
});

test('user cannot exceed boosted prediction limit', function () {
    $fixture1 = createScoringFixture();
    $fixture2 = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 2,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 2,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    foreach ([$fixture1, $fixture2] as $fixture) {
        $prediction = Prediction::query()->create([
            'fixture_id' => $fixture->id,
            'user_id' => $user->id,
            'source' => PredictionTypes::User->value,
            'home_goals' => 2,
            'away_goals' => 1,
            'total_goals' => 3,
        ]);

        ScoreboardPrediction::query()->create([
            'scoreboard_id' => $scoreboard->id,
            'prediction_id' => $prediction->id,
            'is_boosted' => true,
        ]);
    }

    $fixture3 = createScoringFixture();

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture3), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => true,
        ])
        ->assertSessionHasErrors('is_boosted');
});

test('boosted bonus is applied when prediction is correct and confidence is above threshold', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
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

    expect($scoreboardPrediction->points)->toBe(14); // exact 10 + bonus 4
});

test('boosted bonus is not applied to wrong predictions', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
        'home_goals' => 0,
        'away_goals' => 2,
        'total_goals' => 2,
        'confidence' => 'high',
    ]);

    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => true,
    ]);

    $prediction->forceFill([
        'points' => 0,
        'points_awarded_at' => now('UTC'),
    ])->save();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction->points)->toBe(0);
});

test('boosted bonus is not applied when confidence is below threshold', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
        'confidence' => 'low',
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

    expect($scoreboardPrediction->points)->toBe(10); // exact 10, no bonus
});

test('boosted bonus is not applied when prediction is not marked as boosted', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
        'confidence' => 'high',
    ]);

    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => false,
    ]);

    $prediction->forceFill([
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ])->save();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction->points)->toBe(10); // exact 10, no bonus
});

test('boosted bonus is not applied when boosted predictions are disabled', function () {
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => false,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 4,
        ],
    ]);
    $user = User::factory()->create();
    $scoreboard->users()->attach($user->id);

    $prediction = createScoringPrediction($fixture, [
        'user_id' => $user->id,
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

    expect($scoreboardPrediction->points)->toBe(10); // exact 10, no bonus
});

test('prediction score service supports custom scoring rules', function () {
    $service = new PredictionScoreService;

    $rules = [
        'exact_score_points' => 10,
        'correct_result_points' => 5,
        'correct_goal_difference_points' => 3,
        'correct_home_goals_points' => 1,
        'correct_away_goals_points' => 1,
    ];

    $exact = $service->calculateWithRules(2, 1, 2, 1, $rules);
    expect($exact)->toBe(10);

    $partial = $service->calculateWithRules(3, 1, 2, 1, $rules);
    expect($partial)->toBe(6); // outcome(5) + away(1) = 6

    $partial2 = $service->calculateWithRules(2, 0, 2, 1, $rules);
    expect($partial2)->toBe(6); // outcome(5) + home(1) = 6
});

test('user prediction service stores boost status for a scoreboard', function () {
    $user = User::factory()->create();
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 2,
        ],
    ]);
    $scoreboard->users()->attach($user->id);

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
            'confidence' => 'medium',
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => true,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $prediction = Prediction::query()
        ->where('fixture_id', $fixture->id)
        ->where('user_id', $user->id)
        ->first();

    expect($prediction)->not->toBeNull();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction)->not->toBeNull()
        ->and($scoreboardPrediction->is_boosted)->toBe(true);
});

test('editing a prediction preserves existing boost status', function () {
    $user = User::factory()->create();
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
        'scoring_rules' => [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => true,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'medium',
            'boosted_prediction_bonus_points' => 2,
        ],
    ]);
    $scoreboard->users()->attach($user->id);

    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 1,
        'total_goals' => 2,
    ]);

    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => true,
    ]);

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
            'confidence' => 'medium',
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => true,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction->is_boosted)->toBe(true);
});

test('user can unboost a prediction', function () {
    $user = User::factory()->create();
    $fixture = createScoringFixture();
    $scoreboard = Scoreboard::query()->create([
        'name' => 'Boost League',
        'code' => 'BOOST1',
    ]);
    $scoreboard->users()->attach($user->id);

    $prediction = Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 1,
        'total_goals' => 2,
    ]);

    ScoreboardPrediction::query()->create([
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => true,
    ]);

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => false,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $updatedPrediction = Prediction::query()
        ->where('fixture_id', $fixture->id)
        ->where('user_id', $user->id)
        ->first();

    expect($updatedPrediction->id)->toBe($prediction->id);

    $scoreboardPrediction = ScoreboardPrediction::query()
        ->where('scoreboard_id', $scoreboard->id)
        ->where('prediction_id', $prediction->id)
        ->first();

    expect($scoreboardPrediction->is_boosted)->toBe(false);
});
