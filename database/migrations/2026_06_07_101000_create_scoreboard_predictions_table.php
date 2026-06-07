<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scoreboard_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scoreboard_id')->constrained()->onDelete('cascade');
            $table->foreignId('prediction_id')->constrained()->onDelete('cascade');
            $table->boolean('is_boosted')->default(false);
            $table->integer('points')->nullable();
            $table->timestamp('points_awarded_at')->nullable();
            $table->timestamps();

            $table->unique(['scoreboard_id', 'prediction_id']);
            $table->index('prediction_id');
        });

        // Backfill scoreboard_predictions for existing user predictions and memberships
        DB::statement(<<<SQL
            INSERT INTO scoreboard_predictions (
                scoreboard_id, prediction_id, is_boosted, points, points_awarded_at, created_at, updated_at
            )
            SELECT
                uhs.scoreboard_id,
                p.id,
                0,
                p.points,
                p.points_awarded_at,
                NOW(),
                NOW()
            FROM predictions p
            INNER JOIN users_has_scoreboards uhs ON uhs.user_id = p.user_id
            WHERE p.source = 'user'
            ON DUPLICATE KEY UPDATE
                points = VALUES(points),
                points_awarded_at = VALUES(points_awarded_at),
                updated_at = NOW()
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('scoreboard_predictions');
    }
};
