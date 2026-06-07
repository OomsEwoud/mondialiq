<?php

namespace App\Models\Concerns;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

trait HasFixtureStatus
{
    public const NOT_STARTED_STATUS_SHORT = 'NS';

    public const LIVE_STATUS_SHORTS = [
        '1H',
        'HT',
        '2H',
        'ET',
        'BT',
        'P',
        'LIVE',
    ];

    public const FINISHED_STATUS_SHORTS = ['FT', 'AET', 'PEN'];

    public const UNAVAILABLE_UPCOMING_STATUS_SHORTS = [
        '1H',
        'HT',
        '2H',
        'ET',
        'BT',
        'P',
        'LIVE',
        'FT',
        'AET',
        'PEN',
        'CANC',
        'PST',
        'ABD',
        'AWD',
        'WO',
        'SUSP',
        'INT',
    ];

    private const UNAVAILABLE_UPCOMING_STATUS_LONG_PATTERNS = [
        '%Abandon%',
        '%Award%',
        '%Cancel%',
        '%Finished%',
        '%Forfeit%',
        '%Interrupt%',
        '%Postpon%',
        '%Suspend%',
        '%Walk%',
    ];

    private const LIVE_STATUS_LONG_PATTERNS = [
        '%First Half%',
        '%Halftime%',
        '%Half Time%',
        '%Second Half%',
        '%Extra Time%',
        '%Break Time%',
        '%Penalty%',
        '%In Progress%',
        '%Suspended%',
        '%Interrupted%',
        '%Live%',
    ];

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where(
            fn (Builder $query) => $query
                ->whereIn('status_short', self::LIVE_STATUS_SHORTS)
                ->orWhere(
                    fn (Builder $query) => $this->statusLongMatches(
                        $query,
                        self::LIVE_STATUS_LONG_PATTERNS,
                    ),
                ),
        );
    }

    public function scopeNotStarted(Builder $query): Builder
    {
        return $query->where(
            fn (Builder $query) => $query
                ->where('status_short', self::NOT_STARTED_STATUS_SHORT)
                ->orWhere(
                    fn (Builder $query) => $query
                        ->whereNull('status_short')
                        ->where('status_long', 'Not Started'),
                ),
        );
    }

    public function scopeUpcomingNotStarted(Builder $query): Builder
    {
        $now = now('UTC');

        foreach (self::UNAVAILABLE_UPCOMING_STATUS_LONG_PATTERNS as $statusPattern) {
            $query->where('status_long', 'not like', $statusPattern);
        }

        return $query
            ->where('match_date', '>', $now->format('Y-m-d H:i:s'))
            ->where(
                fn (Builder $query) => $query
                    ->where('status_short', self::NOT_STARTED_STATUS_SHORT)
                    ->orWhere(
                        fn (Builder $query) => $query
                            ->whereNull('status_short')
                            ->where('status_long', 'Not Started'),
                    ),
            )
            ->where(
                fn (Builder $query) => $query
                    ->whereNull('status_short')
                    ->orWhereNotIn('status_short', self::UNAVAILABLE_UPCOMING_STATUS_SHORTS),
            );
    }

    public function scopeFinished(Builder $query): Builder
    {
        return $query->where(
            fn (Builder $query) => $query
                ->whereIn('status_short', self::FINISHED_STATUS_SHORTS)
                ->orWhere('status_long', 'like', '%Finished%'),
        );
    }

    public function isLive(): bool
    {
        return in_array($this->status_short, self::LIVE_STATUS_SHORTS, true)
            || $this->statusLongMatchesValue($this->status_long);
    }

    public function isNotStarted(): bool
    {
        return $this->status_short === self::NOT_STARTED_STATUS_SHORT
            || ($this->status_short === null && $this->status_long === 'Not Started');
    }

    public function isFinished(): bool
    {
        return in_array($this->status_short, self::FINISHED_STATUS_SHORTS, true)
            || str_contains($this->status_long ?? '', 'Finished');
    }

    private function statusLongMatches(Builder $query, array $patterns): Builder
    {
        return $query->where(function (Builder $query) use ($patterns) {
            foreach ($patterns as $index => $pattern) {
                if ($index === 0) {
                    $query->where('status_long', 'like', $pattern);

                    continue;
                }

                $query->orWhere('status_long', 'like', $pattern);
            }
        });
    }

    private function statusLongMatchesValue(?string $statusLong): bool
    {
        if ($statusLong === null) {
            return false;
        }

        foreach (self::LIVE_STATUS_LONG_PATTERNS as $pattern) {
            $needle = trim($pattern, '%');

            if (str_contains($statusLong, $needle)) {
                return true;
            }
        }

        return false;
    }
}
