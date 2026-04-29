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
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('winner_id')->nullable()->constrained('teams')->onDelete('set null');
            $table->string('source')->default('user');
            $table->string('winner_comment')->nullable();
            $table->integer('total_goals')->nullable();
            $table->integer('home_goals')->nullable();
            $table->integer('away_goals')->nullable();
            $table->string('advice')->nullable();
            $table->decimal('home_chance', 5, 2)->nullable();
            $table->decimal('draw_chance', 5, 2)->nullable();
            $table->decimal('away_chance', 5, 2)->nullable();
            $table->integer('points')->default(0);
            $table->unique(['user_id', 'fixture_id']);
            $table->index('fixture_id');
            $table->index('user_id');
            $table->index('source');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
