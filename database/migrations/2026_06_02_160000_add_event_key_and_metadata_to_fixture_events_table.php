<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixture_events', function (Blueprint $table) {
            $table->string('event_key', 32)->nullable()->after('fixture_id');
            $table->string('team_name')->nullable()->after('team_id');
            $table->string('player_name')->nullable()->after('player_id');
            $table->string('assist_name')->nullable()->after('assist_id');
            $table->text('comments')->nullable()->after('detail');
            $table->unique(['fixture_id', 'event_key'], 'fixture_events_fixture_id_event_key_unique');
        });
    }

    public function down(): void
    {
        Schema::table('fixture_events', function (Blueprint $table) {
            $table->dropUnique('fixture_events_fixture_id_event_key_unique');
            $table->dropColumn([
                'event_key',
                'team_name',
                'player_name',
                'assist_name',
                'comments',
            ]);
        });
    }
};
