<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->string('status_short')->nullable()->after('match_date');
            $table->index('status_short');
        });

        DB::table('fixtures')
            ->select(['id', 'status_long'])
            ->orderBy('id')
            ->chunkById(250, function ($fixtures): void {
                foreach ($fixtures as $fixture) {
                    DB::table('fixtures')
                        ->where('id', $fixture->id)
                        ->update([
                            'status_short' => match ($fixture->status_long) {
                                'First Half' => '1H',
                                'Halftime' => 'HT',
                                '2nd Half Started', 'Second Half' => '2H',
                                'Extra Time' => 'ET',
                                'Break Time' => 'BT',
                                'Penalty In Progress' => 'P',
                                'In Progress', 'Kick Off', 'Match Suspended', 'Match Interrupted' => 'LIVE',
                                'Finished', 'Match Finished' => 'FT',
                                default => null,
                            },
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('fixtures', function (Blueprint $table) {
            $table->dropIndex(['status_short']);
            $table->dropColumn('status_short');
        });
    }
};
