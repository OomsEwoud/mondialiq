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
        Schema::create('standings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id')->nullable()->unique();
            $table->string('group_name');
            $table->integer('points')->default(0);
            $table->integer('rank')->default(1);
            $table->integer('matches_played')->default(0);
            $table->integer('wins')->default(0);
            $table->integer('draws')->default(0);
            $table->integer('losses')->default(0);
            $table->integer('goals_for')->default(0);
            $table->integer('goals_against')->default(0);
            $table->integer('goal_difference')->default(0);
            $table->string('form', 10)->nullable();
            $table->string('attacking_form')->nullable();
            $table->string('defensive_form')->nullable();
            $table->integer('goals_scored_last_5')->nullable();
            $table->integer('goals_conceded_last_5')->nullable();
            $table->integer('season'); 
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->unique(['team_id', 'league_id', 'season']);
            $table->index('group_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('standings');
    }
};
