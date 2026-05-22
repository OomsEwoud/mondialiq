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
        Schema::table('missing_players', function (Blueprint $table) {
            $table->string('type')->nullable()->after('player_id');
            $table->text('reason')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('missing_players', function (Blueprint $table) {
            $table->dropColumn(['type', 'reason']);
        });
    }
};