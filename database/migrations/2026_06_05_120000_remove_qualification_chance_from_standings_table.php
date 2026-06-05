<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('standings', 'qualification_chance')) {
            return;
        }

        Schema::table('standings', function (Blueprint $table) {
            $table->dropColumn('qualification_chance');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('standings', 'qualification_chance')) {
            return;
        }

        Schema::table('standings', function (Blueprint $table) {
            $table->decimal('qualification_chance', 5, 2)
                ->nullable()
                ->after('goal_difference');
        });
    }
};
