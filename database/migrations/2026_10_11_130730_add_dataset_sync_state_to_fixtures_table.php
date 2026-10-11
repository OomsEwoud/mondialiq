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
        Schema::table('fixtures', function (Blueprint $table) {
            $table->timestamp('final_data_attempted_at')->nullable();
            $table->timestamp('player_stats_attempted_at')->nullable();
            $table->timestamp('events_synced_at')->nullable();
            $table->timestamp('statistics_synced_at')->nullable();
            $table->index(['league_id', 'season', 'status_short', 'match_date'], 'fixtures_sync_selection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->dropIndex('fixtures_sync_selection');
            $table->dropColumn(['final_data_attempted_at', 'player_stats_attempted_at', 'events_synced_at', 'statistics_synced_at']);
        });
    }
};
