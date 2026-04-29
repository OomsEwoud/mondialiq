<?php

use Carbon\Carbon;
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
        Schema::create('player_season_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->foreignId('league_id')->constrained()->onDelete('cascade');
            $table->integer('season')->default(Carbon::now()->year);
            $table->integer('appearances')->default(0);
            $table->integer('total_minutes')->default(0);
            $table->string('position')->nullable();
            $table->decimal('rating', 8, 2)->default(0);
            $table->boolean('is_captain')->default(false);
            $table->integer('substitutes_in')->default(0);
            $table->integer('substitutes_out')->default(0);
            $table->integer('bench')->default(0);
            $table->integer('total_shots')->default(0);
            $table->integer('shots_on_target')->default(0);
            $table->integer('total_goals')->default(0);
            $table->integer('total_goals_conceded')->default(0); 
            $table->integer('total_assists')->default(0);
            $table->integer('total_saves')->default(0); 
            $table->integer('total_passes')->default(0);
            $table->integer('key_passes')->default(0);
            $table->decimal('pass_accuracy', 8, 2)->default(0);
            $table->integer('total_tackles')->default(0);
            $table->integer('total_blocks')->default(0);
            $table->integer('total_interceptions')->default(0);
            $table->integer('total_duels')->default(0);
            $table->integer('duels_won')->default(0);
            $table->integer('total_dribbles_attempts')->default(0);
            $table->integer('dribbles_success')->default(0);
            $table->integer('dribbles_past')->default(0);
            $table->integer('fouls_drawn')->default(0);
            $table->integer('fouls_committed')->default(0);
            $table->integer('yellow_cards')->default(0);
            $table->integer('yellow_red_cards')->default(0);
            $table->integer('red_cards')->default(0);
            $table->integer('penalties_won')->default(0);
            $table->integer('penalties_committed')->default(0);
            $table->integer('penalties_scored')->default(0);
            $table->integer('penalties_missed')->default(0);
            $table->integer('penalties_saved')->default(0); 
            $table->unique(['player_id', 'league_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_season_stats');
    }
};
