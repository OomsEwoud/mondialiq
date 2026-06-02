<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureEvent extends Model
{
    protected $fillable = [
        'fixture_id',
        'event_key',
        'team_id',
        'team_name',
        'player_id',
        'player_name',
        'assist_id',
        'assist_name',
        'time_elapsed',
        'extra_time',
        'type',
        'detail',
        'comments',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'time_elapsed' => 'integer',
            'extra_time' => 'integer',
        ];
    }

    public static function buildEventKey(
        int $fixtureId,
        int $timeElapsed,
        ?int $timeExtra,
        int $teamId,
        string $type,
        string $detail,
    ): string {
        return md5(implode('|', [
            $fixtureId,
            $timeElapsed,
            $timeExtra ?? 0,
            $teamId,
            trim($type),
            trim($detail),
        ]));
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function assist(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'assist_id');
    }
}
