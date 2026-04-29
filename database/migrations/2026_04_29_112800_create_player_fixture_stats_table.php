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
        Schema::create('player_fixture_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->integer('game_minutes')->default(0);
            $table->integer('number');
            $table->string('position');
            $table->decimal('rating', 3, 2)->nullable();
            $table->boolean('is_captain')->default(false);
            $table->boolean('is_substitute')->default(false);
            $table->integer('offsides')->default(0);
            $table->integer('total_shots')->default(0);
            $table->integer('shots_on_target')->default(0);
            $table->integer('goals')->default(0);
            $table->integer('goals_conceded')->default(0);
            $table->integer('assists')->default(0);
            $table->integer('saves')->default(0);
            $table->integer('passes')->default(0);
            $table->integer('key_passes')->default(0);
            $table->decimal('passes_accuracy', 5, 2)->default(0);
            $table->integer('tackles')->default(0);
            $table->integer('blocks')->default(0);
            $table->integer('interceptions')->default(0);
            $table->integer('duels')->default(0);
            $table->integer('duels_won')->default(0);
            $table->integer('dribbles_attempts')->default(0);
            $table->integer('dribbles_success')->default(0);
            $table->integer('dribbles_past')->default(0);
            $table->integer('fouls_drawn')->default(0);
            $table->integer('fouls_committed')->default(0);
            $table->integer('yellow_cards')->default(0);
            $table->integer('red_cards')->default(0);
            $table->integer('penalties_won')->default(0);
            $table->integer('penalties_committed')->default(0);
            $table->integer('penalties_scored')->default(0);
            $table->integer('penalties_missed')->default(0);
            $table->integer('penalties_saved')->default(0);
            $table->unique(['fixture_id', 'player_id']);
            $table->index('player_id');
            $table->index('fixture_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_fixture_stats');
    }
};
