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
        Schema::create('ml_import_batches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('provider_league_id');
            $table->integer('season');
            $table->string('provider')->default('api-football');
            $table->string('endpoint')->default('/fixtures');
            $table->unsignedInteger('schema_version')->default(1);
            $table->json('payload');
            $table->string('payload_sha256', 64);
            $table->unsignedInteger('next_index')->default(0);
            $table->timestamp('fetched_at');
            $table->timestamp('completed_at')->nullable();
            $table->index(['provider_league_id', 'season', 'id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ml_import_batches');
    }
};
