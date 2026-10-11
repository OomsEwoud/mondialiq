<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use App\Services\Football\FixtureSyncService;
use App\Services\Standing\StandingService;
use App\Services\Team\TeamService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Signature(
    'app:seed-historical-season'
    .' {leagueId : API-Football league id}'
    .' {season : Season year}'
    .' {--sleep=1 : Aantal seconden pauze tussen per-fixture API calls}'
    .' {--only-finished : Verwerk enkel fixtures met finished status}'
    .' {--skip-fixture-data : Sla events/statistics/lineups over en importeer enkel teams, fixtures en standings}'
    .' {--skip-standings : Sla standings over}'
    .' {--skip-teams : Sla teams import over en gebruik enkel bestaande teams}'
    .' {--retry-incomplete : Reset uitgeputte pogingen voor onvolledige historische datasets}'
)]
#[Description('Importeer historische voetbalseizoenen vanuit API-Football voor demo data')]
class SeedHistoricalSeasonCommand extends Command
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly TeamService $teamService,
        private readonly FixtureService $fixtureService,
        private readonly StandingService $standingService,
        private readonly FixtureSyncService $syncService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $leagueId = (int) $this->argument('leagueId');
        $season = (int) $this->argument('season');
        $sleep = (int) $this->option('sleep');
        $onlyFinished = (bool) $this->option('only-finished');
        $skipFixtureData = (bool) $this->option('skip-fixture-data');
        $skipStandings = (bool) $this->option('skip-standings');
        $skipTeams = (bool) $this->option('skip-teams');

        $this->info('Historisch seizoen importeren');
        $this->line("League ID: {$leagueId}");
        $this->line("Season: {$season}");
        $this->line("Sleep: {$sleep}s");
        $this->line('Only finished: '.($onlyFinished ? 'ja' : 'nee'));
        $this->line('Skip fixture data: '.($skipFixtureData ? 'ja' : 'nee'));
        $this->line('Skip standings: '.($skipStandings ? 'ja' : 'nee'));
        $this->line('Skip teams: '.($skipTeams ? 'ja' : 'nee'));
        $this->newLine();

        $teamsImported = false;

        if ($skipTeams) {
            $this->warn('Teams import wordt overgeslagen (--skip-teams is actief).');
            $this->newLine();
        } else {
            $this->importTeams($leagueId, $season);
            $teamsImported = true;
        }

        $fixtureStats = $this->importFixtures($leagueId, $season);

        $fixtures = $this->resolveFixtures($leagueId, $season, $onlyFinished);

        $fixtureSummary = [
            'found' => 0,
            'processed' => 0,
            'skipped' => 0,
            'errors' => 0,
        ];

        if (! $skipFixtureData && $fixtures->isNotEmpty()) {
            $fixtureSummary = $this->importFixtureData($fixtures, $sleep);
        }

        $standingsImported = false;
        if (! $skipStandings) {
            $standingsImported = $this->importStandings($leagueId, $season);
        }

        $this->newLine();
        $this->info('Import samenvatting');
        $this->line('Teams geïmporteerd: '.($teamsImported ? 'ja' : 'nee (overgeslagen)'));
        $this->line('Teams lazy aangemaakt: '.$fixtureStats['lazy_teams_created']);
        $this->line('Fixtures gevonden: '.($fixtureStats['imported'] + $fixtureStats['skipped']));
        $this->line('Fixtures verwerkt: '.$fixtureStats['imported']);
        $this->line('Fixtures overgeslagen: '.$fixtureStats['skipped']);
        $this->line('Per-fixture verwerkt: '.$fixtureSummary['processed']);
        $this->line('Per-fixture fouten: '.$fixtureSummary['errors']);
        $this->line('Standings geïmporteerd: '.($standingsImported ? 'ja' : 'nee'));

        return $fixtureSummary['errors'] === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function importTeams(int $leagueId, int $season): void
    {
        $this->info('Teams ophalen...');

        $teams = $this->api->getTeams($leagueId, $season);

        if (empty($teams)) {
            $this->warn('Geen teams ontvangen van de API.');

            return;
        }

        $this->info(count($teams).' teams ontvangen, opslaan...');
        $this->teamService->storeTeams($teams);
        $this->info('Teams opgeslagen.');
    }

    private function importFixtures(int $leagueId, int $season): array
    {
        $this->info('Fixtures ophalen...');

        $fixtures = $this->api->getFixtures($leagueId, $season);

        if (empty($fixtures)) {
            $this->warn('Geen fixtures ontvangen van de API.');

            return ['imported' => 0, 'skipped' => 0, 'lazy_teams_created' => 0];
        }

        $this->info(count($fixtures).' fixtures ontvangen, opslaan...');
        $stats = $this->fixtureService->storeFixtures($fixtures);
        $this->info('Fixtures opgeslagen.');

        if ($stats['lazy_teams_created'] > 0) {
            $this->warn($stats['lazy_teams_created'].' team(s) lazy aangemaakt uit fixture data.');
        }

        return $stats;
    }

    private function resolveFixtures(int $leagueId, int $season, bool $onlyFinished): Collection
    {
        $this->info('Lokale fixtures opzoeken...');

        $query = Fixture::query()
            ->whereNotNull('external_id')
            ->where('season', $season)
            ->whereHas('league', fn ($q) => $q->where('external_id', $leagueId));

        if ($onlyFinished) {
            $query->finished();
        }
        $query->orderBy('match_date');
        $fixtures = $query->get();
        $this->info("{$fixtures->count()} fixtures geselecteerd voor verdere verwerking.");

        return $fixtures;
    }

    private function importFixtureData(Collection $fixtures, int $sleep): array
    {
        $this->info('Per-fixture data importeren (events, statistics, lineups)...');

        $found = $fixtures->count();
        $processed = 0;
        $skipped = 0;
        $errors = 0;

        $bar = $this->output->createProgressBar($found);
        $bar->start();

        foreach ($fixtures as $fixture) {
            if (! $fixture->external_id) {
                $skipped++;
                $bar->advance();

                continue;
            }

            try {
                if (! $fixture->isFinished()) {
                    $skipped++;
                    $bar->advance();

                    continue;
                }
                if ($this->option('retry-incomplete')) {
                    Cache::lock('football:fixture:'.$fixture->id, 3600)->get(function () use ($fixture): void {
                        $fixture->refresh();
                        foreach (['final_data', 'player_stats'] as $dataset) {
                            if ($fixture->{$dataset.'_synced_at'} === null || ($dataset === 'player_stats' && ! $fixture->has_lineups)) {
                                $fixture->forceFill([$dataset.'_sync_attempts' => 0, $dataset.'_attempted_at' => null])->save();
                            }
                        }
                    });
                }
                $errors += $this->syncService->run('post-match', (bool) config('football_sync.batch_fixtures'), $fixture->id, true);

                $processed++;
            } catch (Throwable $e) {
                $errors++;
                $this->newLine();
                $this->warn("Fout bij fixture {$fixture->id} (external {$fixture->external_id}): {$e->getMessage()}");
                Log::warning('Historical season import: fixture data failed', [
                    'fixture_id' => $fixture->id,
                    'external_id' => $fixture->external_id,
                    'error' => $e->getMessage(),
                ]);
            }

            $bar->advance();

            if ($sleep > 0) {
                sleep($sleep);
            }
        }

        $bar->finish();
        $this->newLine();

        return [
            'found' => $found,
            'processed' => $processed,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    private function importStandings(int $leagueId, int $season): bool
    {
        $this->info('Standings ophalen...');

        $standings = $this->api->getStandings($leagueId, $season);

        if (empty($standings)) {
            $this->warn('Geen standings ontvangen van de API.');

            return false;
        }

        $this->info('Standings opslaan...');
        $this->standingService->storeStandings($standings);
        $this->info('Standings opgeslagen.');

        return true;
    }
}
