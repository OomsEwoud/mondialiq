<?php

namespace App\Jobs;

use App\Services\Apis\FootballApiContext;
use App\Services\Football\FixtureSyncService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class SyncFootballBatch implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 3300;

    public int $uniqueFor = 3360;

    /** @param list<int> $fixtureIds */
    public function __construct(public readonly array $fixtureIds, public readonly string $phase)
    {
        if ($fixtureIds === [] || count($fixtureIds) > 20) {
            throw new InvalidArgumentException('Football jobs require between 1 and 20 fixture IDs.');
        }
        $this->onConnection('football')->onQueue('football');
    }

    public function uniqueId(): string
    {
        $ids = $this->fixtureIds;
        sort($ids);

        return $this->phase.':'.implode('-', $ids);
    }

    public function handle(FixtureSyncService $service, FootballApiContext $context): void
    {
        $context->push(self::class.':'.$this->phase);
        try {
            if ($service->run($this->phase, (bool) config('football_sync.batch_fixtures'), fixtureIds: $this->fixtureIds) > 0) {
                throw new RuntimeException('Football batch incomplete; bounded dataset retries are scheduled separately.');
            }
        } finally {
            $context->pop();
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::warning('football_sync.batch_job_failed', ['fixture_ids' => $this->fixtureIds, 'phase' => $this->phase]);
    }
}
