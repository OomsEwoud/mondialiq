<?php

namespace App\Jobs;

use App\Services\Apis\FootballApiContext;
use App\Services\Football\FixtureSyncService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class SyncFootballFixture implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 300;

    public int $uniqueFor = 360;

    public function __construct(public readonly int $fixtureId, public readonly string $phase)
    {
        $this->onConnection('football')->onQueue('football');
    }

    public function uniqueId(): string
    {
        return $this->fixtureId.':'.$this->phase;
    }

    public function handle(FixtureSyncService $service, FootballApiContext $context): void
    {
        $context->push(self::class.':'.$this->phase);
        try {
            if ($service->run($this->phase, (bool) config('football_sync.batch_fixtures'), $this->fixtureId) > 0) {
                throw new RuntimeException('Football fixture sync failed; dataset retries are scheduled separately.');
            }
        } finally {
            $context->pop();
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::warning('football_sync.job_failed', ['fixture_id' => $this->fixtureId, 'phase' => $this->phase]);
    }
}
