<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->timestamp('fixture_basics_synced_at')->nullable()->after('result');
            $table->boolean('has_lineups')->default(false)->after('fixture_basics_synced_at');
            $table->timestamp('lineups_synced_at')->nullable()->after('has_lineups');
            $table->unsignedTinyInteger('lineup_sync_attempts')->default(0)->after('lineups_synced_at');
            $table->timestamp('final_data_synced_at')->nullable()->after('lineup_sync_attempts');
            $table->unsignedTinyInteger('final_data_sync_attempts')->default(0)->after('final_data_synced_at');
            $table->timestamp('player_stats_synced_at')->nullable()->after('final_data_sync_attempts');
            $table->unsignedTinyInteger('player_stats_sync_attempts')->default(0)->after('player_stats_synced_at');

            $table->index(['status_short', 'match_date']);
            $table->index(['has_lineups', 'lineups_synced_at']);
            $table->index(['final_data_synced_at', 'final_data_sync_attempts']);
            $table->index(['player_stats_synced_at', 'player_stats_sync_attempts']);
        });
    }

    public function down(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->dropIndex(['status_short', 'match_date']);
            $table->dropIndex(['has_lineups', 'lineups_synced_at']);
            $table->dropIndex(['final_data_synced_at', 'final_data_sync_attempts']);
            $table->dropIndex(['player_stats_synced_at', 'player_stats_sync_attempts']);

            $table->dropColumn([
                'fixture_basics_synced_at',
                'has_lineups',
                'lineups_synced_at',
                'lineup_sync_attempts',
                'final_data_synced_at',
                'final_data_sync_attempts',
                'player_stats_synced_at',
                'player_stats_sync_attempts',
            ]);
        });
    }
};
