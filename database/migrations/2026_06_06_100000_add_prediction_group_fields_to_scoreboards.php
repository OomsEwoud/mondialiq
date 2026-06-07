<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scoreboards', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('reward_title')->nullable()->after('code');
            $table->text('reward_description')->nullable()->after('reward_title');
            $table->string('visibility', 20)->default('private')->after('reward_description');
            $table->boolean('is_active')->default(true)->after('visibility');
        });

        Schema::table('users_has_scoreboards', function (Blueprint $table) {
            $table->string('role', 20)->default('member')->after('scoreboard_id');
            $table->timestamp('joined_at')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users_has_scoreboards', function (Blueprint $table) {
            $table->dropColumn(['role', 'joined_at']);
        });

        Schema::table('scoreboards', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'reward_title',
                'reward_description',
                'visibility',
                'is_active',
            ]);
        });
    }
};
