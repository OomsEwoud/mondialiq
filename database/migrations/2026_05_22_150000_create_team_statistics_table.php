<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('team_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('league_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('api_team_id');
            $table->unsignedBigInteger('api_league_id');
            $table->integer('season');
            $table->date('statistics_date')->nullable();
            $table->string('statistics_key')->unique();
            $table->string('form')->nullable();
            $table->integer('fixtures_played_home')->default(0);
            $table->integer('fixtures_played_away')->default(0);
            $table->integer('fixtures_played_total')->default(0);
            $table->integer('wins_home')->default(0);
            $table->integer('wins_away')->default(0);
            $table->integer('wins_total')->default(0);
            $table->integer('draws_home')->default(0);
            $table->integer('draws_away')->default(0);
            $table->integer('draws_total')->default(0);
            $table->integer('losses_home')->default(0);
            $table->integer('losses_away')->default(0);
            $table->integer('losses_total')->default(0);
            $table->integer('goals_for_home')->default(0);
            $table->integer('goals_for_away')->default(0);
            $table->integer('goals_for_total')->default(0);
            $table->decimal('goals_for_avg_home', 8, 2)->nullable();
            $table->decimal('goals_for_avg_away', 8, 2)->nullable();
            $table->decimal('goals_for_avg_total', 8, 2)->nullable();
            $table->integer('goals_against_home')->default(0);
            $table->integer('goals_against_away')->default(0);
            $table->integer('goals_against_total')->default(0);
            $table->decimal('goals_against_avg_home', 8, 2)->nullable();
            $table->decimal('goals_against_avg_away', 8, 2)->nullable();
            $table->decimal('goals_against_avg_total', 8, 2)->nullable();
            $table->integer('clean_sheets_home')->default(0);
            $table->integer('clean_sheets_away')->default(0);
            $table->integer('clean_sheets_total')->default(0);
            $table->integer('failed_to_score_home')->default(0);
            $table->integer('failed_to_score_away')->default(0);
            $table->integer('failed_to_score_total')->default(0);
            $table->integer('biggest_wins_streak')->default(0);
            $table->integer('biggest_draws_streak')->default(0);
            $table->integer('biggest_losses_streak')->default(0);
            $table->string('most_used_formation')->nullable();
            $table->json('lineups')->nullable();
            $table->json('cards')->nullable();
            $table->json('goals_by_minute')->nullable();
            $table->json('raw_data')->nullable();
            $table->dateTime('fetched_at')->nullable();
            $table->index('api_team_id');
            $table->index('api_league_id');
            $table->index('season');
            $table->index(['api_team_id', 'api_league_id', 'season', 'statistics_date'], 'team_stats_lookup_idx');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_statistics');
    }
};
