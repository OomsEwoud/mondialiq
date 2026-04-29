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
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('external_id')->nullable()->unique();
            $table->foreignId('country_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('display_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('position')->nullable();
            $table->integer('number')->nullable();
            $table->index('last_name');
            $table->index('display_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
