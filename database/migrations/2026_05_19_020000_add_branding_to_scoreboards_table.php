<?php

use App\Support\Leagues\LeagueBranding;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scoreboards', function (Blueprint $table) {
            $table->string('icon', 8)
                ->default(LeagueBranding::DEFAULT_ICON)
                ->after('name');
            $table->string('accent_color', 20)
                ->default(LeagueBranding::DEFAULT_ACCENT_COLOR)
                ->after('icon');
            $table->string('cover_style', 20)
                ->default(LeagueBranding::DEFAULT_COVER_STYLE)
                ->after('accent_color');
        });
    }

    public function down(): void
    {
        Schema::table('scoreboards', function (Blueprint $table) {
            $table->dropColumn(['icon', 'accent_color', 'cover_style']);
        });
    }
};
