<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scoreboards', function (Blueprint $table) {
            $table->json('scoring_rules')->nullable()->after('is_active');
        });

        $defaultRules = [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => false,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 'low',
            'boosted_prediction_bonus_points' => 2,
        ];

        DB::table('scoreboards')->update([
            'scoring_rules' => json_encode($defaultRules),
        ]);
    }

    public function down(): void
    {
        Schema::table('scoreboards', function (Blueprint $table) {
            $table->dropColumn('scoring_rules');
        });
    }
};
