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
        Schema::create('head_to_heads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_a_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignId('team_b_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->string('pair_key')->unique();
            $table->integer('total_matches')->default(0);
            $table->integer('team_a_wins')->default(0);
            $table->integer('team_b_wins')->default(0);
            $table->integer('draws')->default(0);
            $table->integer('team_a_goals')->default(0);
            $table->integer('team_b_goals')->default(0);
            $table->dateTime('last_meeting_at')->nullable();
            $table->json('raw_data')->nullable();
            $table->dateTime('fetched_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('head_to_heads');
    }
};
