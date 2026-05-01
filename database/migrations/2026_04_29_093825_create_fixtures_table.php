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
        Schema::create('fixtures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id')->nullable()->unique();
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->foreignId('referee_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('venue_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('home_team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('away_team_id')->constrained('teams')->onDelete('cascade');
            $table->string('round_name');
            $table->integer('season');
            $table->dateTime('match_date');
            $table->string('status_long');
            $table->integer('elapsed_time')->nullable();
            $table->integer('halftime_home_goals')->default(0)->nullable();
            $table->integer('halftime_away_goals')->default(0)->nullable();
            $table->integer('fulltime_home_goals')->default(0)->nullable();
            $table->integer('fulltime_away_goals')->default(0)->nullable();
            $table->integer('extratime_home_goals')->default(0)->nullable();
            $table->integer('extratime_away_goals')->default(0)->nullable();
            $table->integer('penalty_home_goals')->default(0)->nullable();
            $table->integer('penalty_away_goals')->default(0)->nullable();
            $table->string('result')->nullable();
            $table->index('match_date');
            $table->index('league_id');  
            $table->index(['home_team_id', 'away_team_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixtures');
    }
};
