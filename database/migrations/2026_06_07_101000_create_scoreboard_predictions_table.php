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

        DB::table('predictions')
            ->join('users_has_scoreboards', 'users_has_scoreboards.user_id', '=', 'predictions.user_id')
            ->where('predictions.source', 'user')
            ->select([
                'users_has_scoreboards.scoreboard_id',
                'predictions.id as prediction_id',
            ])
            ->selectRaw('0 as is_boosted')
            ->selectRaw('predictions.points')
            ->selectRaw('predictions.points_awarded_at')
            ->selectRaw('? as created_at', [now()])
            ->selectRaw('? as updated_at', [now()])
            ->chunkById(500, function ($rows) {
                $inserts = $rows->map(fn ($row) => (array) $row)->all();

                if (! empty($inserts)) {
                    DB::table('scoreboard_predictions')->insertOrIgnore($inserts);
                }
            }, 'predictions.id');
    }

    public function down(): void
    {
        Schema::dropIfExists('scoreboard_predictions');
    }
};
