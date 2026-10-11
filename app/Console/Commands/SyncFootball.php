<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Jobs\SyncFootballFixture;
use App\Services\Football\CompetitionSyncService;
use App\Services\Football\FixtureSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

#[Signature('football:sync {phase : reference-data, fixtures, live, pre-match, post-match or standings} {--queue : Queue individual fixture syncs on the football connection}')]
#[Description('Synchroniseer API-Football volgens de fase van de competitie of wedstrijd')]
class SyncFootball extends Command
{
    use InteractsWithFootballApiConfig;

    public function handle(FixtureSyncService $fixtures, CompetitionSyncService $competition): int
    {
        if ($this->footballApiConfig() === null) {
            return self::FAILURE;
        }
        $phase = (string) $this->argument('phase');
        if (! in_array($phase, ['reference-data', 'fixtures', 'live', 'pre-match', 'post-match', 'standings'], true)) {
            $this->error('Onbekende syncfase. Gebruik reference-data, fixtures, live, pre-match, post-match of standings.');

            return self::INVALID;
        }
        if ($this->option('queue') && ! in_array($phase, ['live', 'pre-match', 'post-match'], true)) {
            $this->error('--queue is alleen beschikbaar voor fixturefasen.');

            return self::INVALID;
        }

        $lock = Cache::lock('football:phase:'.$phase, 3600);
        if (! $lock->get()) {
            $this->info('Deze syncfase wordt al uitgevoerd.');

            return self::SUCCESS;
        }

        try {
            if ($phase === 'reference-data') {
                return $this->referenceData($competition);
            }
            if ($phase === 'fixtures' || $phase === 'standings') {
                $competition->{$phase}();

                return self::SUCCESS;
            }
            if ($this->option('queue')) {
                foreach ($fixtures->candidates($phase)->orderBy('id')->limit((int) config('football_sync.max_fixtures_per_run'))->pluck('id') as $id) {
                    SyncFootballFixture::dispatch((int) $id, $phase);
                }

                return self::SUCCESS;
            }

            $failed = $fixtures->run($phase, (bool) config('football_sync.batch_fixtures'));
            $this->info("Syncfase {$phase} afgerond; {$failed} fouten.");

            return $failed === 0 ? self::SUCCESS : self::FAILURE;
        } finally {
            $lock->release();
        }
    }

    private function referenceData(CompetitionSyncService $competition): int
    {
        foreach (['countries', 'leagues', 'teams', 'bookmakers', 'coaches', 'venues'] as $dataset) {
            if ($this->call('app:add-'.$dataset) !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        $active = $competition->fixturesQuery()->whereBetween('match_date', [now('Europe/Brussels')->subDay(), now('Europe/Brussels')->addDays(14)])->exists();
        $key = 'football:players:'.config('services.api_football.league_id').':'.config('services.api_football.season').':'.($active ? 'active' : 'idle');
        if (! Cache::has($key)) {
            if ($this->call('app:add-players') !== self::SUCCESS) {
                return self::FAILURE;
            }
            Cache::put($key, true, $active ? 86400 : 604800);
        }

        return self::SUCCESS;
    }
}
