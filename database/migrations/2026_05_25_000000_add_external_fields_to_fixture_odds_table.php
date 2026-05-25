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
        Schema::table('fixture_odds', function (Blueprint $table) {
            $table->unsignedBigInteger('external_bookmaker_id')->nullable()->after('fixture_id');
            $table->string('bookmaker_name')->nullable()->after('external_bookmaker_id');
            $table->unsignedBigInteger('external_bet_id')->nullable()->after('bookmaker_name');
            $table->string('bet_name')->nullable()->after('external_bet_id');
            $table->timestamp('api_updated_at')->nullable()->after('odd');

            $table->unique([
                'fixture_id',
                'external_bookmaker_id',
                'external_bet_id',
                'value',
            ], 'fixture_odds_external_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fixture_odds', function (Blueprint $table) {
            $table->dropUnique('fixture_odds_external_unique');
            $table->dropColumn([
                'external_bookmaker_id',
                'bookmaker_name',
                'external_bet_id',
                'bet_name',
                'api_updated_at',
            ]);
        });
    }
};
