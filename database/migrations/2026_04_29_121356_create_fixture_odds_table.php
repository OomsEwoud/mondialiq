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
        Schema::create('fixture_odds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_id')->constrained()->onDelete('cascade');
            $table->foreignId('bookmaker_id')->constrained()->onDelete('cascade');
            $table->foreignId('bet_type_id')->constrained()->onDelete('cascade');
            $table->string('value');
            $table->decimal('odd', 8, 2);
            $table->index(['fixture_id', 'bet_type_id']);
            $table->index('bookmaker_id');
            $table->unique(['fixture_id', 'bookmaker_id', 'bet_type_id', 'value']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_odds');
    }
};
