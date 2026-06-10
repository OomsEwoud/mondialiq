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
        Schema::table('predictions', function (Blueprint $table) {
            $table->foreignId('scoreboard_id')->nullable()->after('user_id')->constrained('scoreboards')->cascadeOnDelete();
            
            // Safe nullable uniqueness for MySQL/MariaDB
            $table->integer('scoreboard_id_unique')->virtualAs('COALESCE(scoreboard_id, 0)')->after('scoreboard_id');
            
            $table->dropUnique('predictions_user_id_fixture_id_unique');
            $table->unique(['user_id', 'fixture_id', 'scoreboard_id_unique'], 'predictions_user_fixture_scoreboard_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('predictions', function (Blueprint $table) {
            $table->dropUnique('predictions_user_fixture_scoreboard_unique');
            $table->unique(['user_id', 'fixture_id'], 'predictions_user_id_fixture_id_unique');
            $table->dropColumn(['scoreboard_id', 'scoreboard_id_unique']);
        });
    }
};
