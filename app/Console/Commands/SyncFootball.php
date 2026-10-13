<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Jobs\SyncFootballBatch;
use App\Models\Fixture;
use App\Services\Apis\ApiPriority;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Football\CompetitionConfig;
use App\Services\Football\CompetitionSyncService;
use App\Services\Football\FixtureSyncService;
use App\Services\Football\PrematchSyncService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

#[Signature('football:sync {phase=live : reference-data, fixtures, live, pre-match, post-match, standings, odds or predictions} {--queue : Queue fixture batches on the football connection} {--dry-run : Show selection and estimated calls without API requests}')]
#[Description('Synchroniseer API-Football volgens de fase van de competitie of wedstrijd')]
class SyncFootball extends Command
{
    use InteractsWithFootballApiConfig;

    public function handle(): int
    {
        if ($this->footballApiConfig() === null) {
            return self::FAILURE;
        }
        $phase = (string) $this->argument('phase');
        if (! in_array($phase, ['reference-data', 'fixtures', 'live', 'pre-match', 'post-match', 'standings', 'odds', 'predictions'], true)) {
            $this->error('Onbekende syncfase. Gebruik reference-data, fixtures, live, pre-match, post-match, standings, odds of predictions.');

            return self::INVALID;
        }
        if ($this->option('queue') && ! in_array($phase, ['live', 'pre-match', 'post-match'], true)) {
            $this->error('--queue is alleen beschikbaar voor fixturefasen.');

            return self::INVALID;
        }

        if ($this->option('dry-run')) {
            if (in_array($phase, ['odds', 'predictions', 'standings'], true)) {
                return $this->marketDryRun($phase);
            }
            foreach (CompetitionConfig::configured() as $pair) {
                $this->line('Competitie '.$pair->key());
            }
            $fixturePhase = in_array($phase, ['live', 'pre-match', 'post-match'], true);
            $candidates = $fixturePhase ? FixtureSyncService::candidates($phase)->count() : count(CompetitionConfig::configured());
            $count = $fixturePhase ? min($candidates, (int) config('football_sync.max_fixtures_per_run')) : $candidates;
            $calls = $fixturePhase && $phase !== 'pre-match' && config('football_sync.batch_fixtures') ? (int) ceil($count / 20) : $count;
            $budget = app(FootballApiBudget::class);
            $priority = ApiPriority::forPhase($phase);
            $allowed = $budget->available($priority) && ($phase !== 'live' || config('api-football.live_sync_enabled', true));
            $this->line("Kandidaten (exact nu): {$candidates}; geselecteerd binnen runlimiet: {$count}".($fixturePhase ? ' fixtures' : ' competitie-seizoenen'));
            $this->line('Prioriteit: '.$priority->name.'; quotabeleid: '.($allowed ? 'toegestaan' : 'uitgesteld'));
            $this->line('Volgens huidig beleid uitvoerbaar: '.($allowed ? $count : 0).'; uitgesteld: '.($allowed ? $candidates - $count : $candidates).'; locks en quota kunnen tijdens uitvoering veranderen.');
            if ($fixturePhase) {
                $fallbacks = $count * match ($phase) {
                    'live' => 2, 'post-match' => 4, default => 0
                };
                $this->line("Primaire request-batches (exact zonder locks/cache): {$calls}; aanvullende fallbackcalls (schatting): 0–{$fallbacks}; retries niet inbegrepen.");
            } else {
                $this->line('Lokale fixtures binnen geselecteerde paren (exact nu): '.Fixture::query()->forConfiguredCompetition()->count().'; deze fase selecteert competitiegegevens, geen fixturewerk per kandidaat.');
                $this->line('Batches en aanvullende calls: onbekend; afhankelijk van cache, kalenderafwijkingen, teams en paginering.');
            }
            $endpoint = match ($phase) {
                'pre-match' => '/fixtures/lineups',
                'standings' => '/standings',
                'reference-data' => '/countries /leagues /teams /odds/bookmakers /coachs /venues /players /players/squads',
                default => '/fixtures',
            };
            $this->line('Endpoints: '.$endpoint);
            $this->line($phase === 'reference-data' ? 'Calls: variabel; afhankelijk van cache, teams en player-pagination.' : "Geschatte primaire calls: {$calls}; cachehits kunnen verminderen, ontbrekende datasets/retries kunnen verhogen.");
            $this->line('Quota: '.app(FootballApiBudget::class)->status());
            $this->line('Live sync: '.(config('api-football.live_sync_enabled', true) ? 'aan' : 'uit'));

            return self::SUCCESS;
        }
        if (($phase === 'live' && ! config('api-football.live_sync_enabled', true)) || ! app(FootballApiBudget::class)->available(ApiPriority::forPhase($phase))) {
            $this->info('Sync uitgesteld wegens quotabeleid of uitgeschakelde live sync.');

            return self::SUCCESS;
        }

        $lock = Cache::lock('football:phase:'.$phase, 3600);
        if (! $lock->get()) {
            $this->info('Deze syncfase wordt al uitgevoerd.');

            return self::SUCCESS;
        }

        try {
            if (in_array($phase, ['odds', 'predictions'], true)) {
                return $this->call('app:add-'.$phase);
            }
            if ($phase === 'standings') {
                return app(CompetitionSyncService::class)->standings() === 0 ? self::SUCCESS : self::FAILURE;
            }
            if ($phase === 'reference-data') {
                return $this->referenceData();
            }
            if ($phase === 'fixtures') {
                app(CompetitionSyncService::class)->{$phase}();

                return self::SUCCESS;
            }
            if ($this->option('queue')) {
                foreach (FixtureSyncService::candidates($phase)->orderBy('match_date')->orderBy('id')->limit((int) config('football_sync.max_fixtures_per_run'))->pluck('id')->chunk(20) as $ids) {
                    SyncFootballBatch::dispatch($ids->map(fn ($id): int => (int) $id)->values()->all(), $phase);
                }

                return self::SUCCESS;
            }

            $failed = app(FixtureSyncService::class)->run($phase, (bool) config('football_sync.batch_fixtures'));
            $this->info("Syncfase {$phase} afgerond; {$failed} fouten.");

            return $failed === 0 ? self::SUCCESS : self::FAILURE;
        } catch (FootballApiBudgetExceeded) {
            $this->info('Sync uitgesteld wegens API-budget; de volgende geplande run hervat.');

            return self::SUCCESS;
        } finally {
            $lock->release();
        }
    }

    private function marketDryRun(string $phase): int
    {
        $pairs = CompetitionConfig::configured();
        foreach ($pairs as $pair) {
            $this->line('Competitie '.$pair->key());
        }
        $budget = app(FootballApiBudget::class);
        $allowed = $budget->available(ApiPriority::Normal);
        if ($phase === 'standings') {
            $plans = array_map(fn (CompetitionConfig $pair): array => app(CompetitionSyncService::class)->standingsPlan($pair), $pairs);
            $due = count(array_filter($plans, fn (array $plan): bool => $plan['due']));
            $this->line('Lokale relevante fixtures: '.array_sum(array_column($plans, 'fixtures')));
            $this->line('Competitieparen: '.count($pairs).'; due: '.$due.'; freshness/backoff overgeslagen: '.(count($pairs) - $due));
            $this->line('Status overgeslagen: niet van toepassing op competitiebrede standings.');
            $this->line('Primaire requests: '.$due.'; bespaard versus een onvoorwaardelijke run: '.(count($pairs) - $due));
            $this->line('Oude dagstrategie (schatting): '.array_sum(array_column($plans, 'old_daily_calls')).'; nieuwe intervallen (uur): '.implode(', ', array_column($plans, 'hours')));
        } else {
            $plan = app(PrematchSyncService::class)->plan($phase);
            $due = $plan['due'];
            $this->line("Lokale kandidaten: {$plan['candidates']}; due: {$due}; freshness/backoff overgeslagen: {$plan['freshness_skipped']}; status overgeslagen: {$plan['status_skipped']}");
            $saved = $plan['old_requests'] - $plan['requests'];
            $this->line("Primaire requests (eerste pagina's): {$plan['requests']}; oude strategie per run: {$plan['old_requests']}; bespaarde eerste requests: {$saved}");
            $this->line($phase === 'odds' ? 'Extra paginacalls: onbekend; league/season/date bundels bevatten alle pagina’s. Totale besparing is een schatting, geen garantie.' : 'Paginacalls: 0; geen gedocumenteerde predictionbatch beschikbaar.');
        }
        $this->line('Prioriteit: Normal; quota: '.$budget->status().'; beleid: '.($allowed ? 'toegestaan' : 'uitgesteld'));
        $this->line('Door quotabeleid uitgestelde taken: '.($allowed ? 0 : $due).'; actuele locks, cachehits en veranderend quota kunnen uitvoering beperken.');
        $this->line('Read-only: geen HTTP, reservaties, datasetmarkers of jobs.');

        return self::SUCCESS;
    }

    private function referenceData(): int
    {
        $pairs = array_map(fn (CompetitionConfig $pair): string => $pair->key(), CompetitionConfig::configured());
        sort($pairs);
        foreach (['countries', 'leagues', 'teams', 'bookmakers', 'coaches', 'venues'] as $dataset) {
            $key = 'football:reference:'.$dataset.':'.hash('sha256', implode(',', $pairs));
            $ttl = match ($dataset) {
                'countries', 'leagues', 'bookmakers' => 2592000,
                'teams' => 604800,
                default => null,
            };
            if ($ttl !== null && Cache::has($key)) {
                continue;
            }
            if ($this->call('app:add-'.$dataset) !== self::SUCCESS) {
                return self::FAILURE;
            }
            if ($ttl !== null) {
                Cache::put($key, true, $ttl);
            }
        }

        return $this->call('app:add-players', ['--due' => true]);
    }
}
