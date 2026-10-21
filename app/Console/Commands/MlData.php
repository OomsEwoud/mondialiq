<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Models\League;
use App\Services\Apis\FootballApiBudget;
use App\Services\Football\CompetitionConfig;
use App\Services\MachineLearning\HistoricalDataAudit;
use App\Services\MachineLearning\HistoricalDataImporter;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

#[Signature('ml:data {action=plan : plan, import or audit} {--league=*} {--season=*} {--from-season=} {--to-season=} {--dry-run} {--force : Fetch a new snapshot after completed import; never override conflicts}')]
class MlData extends Command
{
    public function handle(HistoricalDataImporter $importer, HistoricalDataAudit $audit, FootballApiBudget $budget): int
    {
        try {
            $action = $this->argument('action');
            if (! in_array($action, ['plan', 'import', 'audit'], true)) {
                throw new InvalidArgumentException('Gebruik plan, import of audit.');
            }
            $competitions = $this->competitions();
            $results = [];
            foreach ($competitions as $competition) {
                if ($action === 'import' && ! $this->option('dry-run')) {
                    $results[$competition->key()] = $importer->run($competition, (bool) $this->option('force'));
                    if (in_array($results[$competition->key()]['status'], ['quota_deferred', 'locked'], true)) {
                        break;
                    }

                    continue;
                }
                $batch = $importer->latest($competition);
                $complete = $batch?->completed_at !== null;
                $fetch = $batch === null || ($complete && $this->option('force'));
                $leagueMissing = ! League::query()->where('external_id', $competition->leagueId)->exists();
                $snapshotIds = $batch ? array_column(array_column($batch->payload, 'fixture'), 'id') : [];
                $localIds = $competition->constrain(Fixture::query())->pluck('external_id')->all();
                $calls = ($complete && ! $this->option('force')) ? 0 : (int) $fetch + (int) $leagueMissing;
                $results[$competition->key()] = [
                    ...$audit->inspect($competition), 'snapshot_imported' => $complete,
                    'batch_id' => $batch?->id, 'resume_index' => $batch?->next_index,
                    'snapshot_fixture_count' => count($snapshotIds), 'missing_snapshot_fixture_ids' => array_values(array_diff($snapshotIds, $localIds)),
                    'unverified_local_fixture_ids' => array_values(array_diff($localIds, $snapshotIds)),
                    'league_mapping_missing' => $leagueMissing,
                    'endpoints' => $calls === 0 ? [] : array_values(array_filter([$fetch ? '/fixtures' : null, $leagueMissing ? '/leagues' : null])),
                    'estimated_requests' => $calls, 'maximum_http_attempts' => $calls * 2,
                ];
            }
            $this->line(json_encode(['action' => $action, 'dry_run' => (bool) $this->option('dry-run'),
                'quota' => ['status' => $budget->status(), 'remaining' => $budget->effectiveRemaining(), 'observed_at' => $budget->quota()?->lastUpdatedAt->toIso8601String()],
                'competitions' => $results,
                'global_missing_context' => Fixture::query()->whereNull('league_id')->orWhereNull('season')->count(),
                'migration_required' => ! Schema::hasTable('ml_import_batches'),
            ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            report($exception);
            $this->error('ML-dataopdracht gestopt: '.$exception->getMessage());

            return self::FAILURE;
        }
    }

    private function competitions(): array
    {
        $leagues = $this->option('league');
        $seasons = $this->option('season');
        $from = $this->option('from-season');
        $to = $this->option('to-season');
        if ($from !== null || $to !== null) {
            if (! ctype_digit((string) $from) || ! ctype_digit((string) $to) || (int) $from < 1900 || (int) $to > 2100 || (int) $from > (int) $to || $seasons !== []) {
                throw new InvalidArgumentException('Geef een geldig exclusief seizoensbereik 1900–2100.');
            }
            $seasons = range((int) $from, (int) $to);
        }
        if ($leagues === [] && $seasons === []) {
            $pairs = config('api-football.ml_competitions');
            if (! is_string($pairs) || trim($pairs) === '') {
                throw new InvalidArgumentException('Selecteer --league en --season of configureer ML_FOOTBALL_COMPETITIONS=39:2022.');
            }
        } else {
            if ($leagues === [] || $seasons === []) {
                throw new InvalidArgumentException('--league en --season zijn samen verplicht.');
            }
            $pairs = [];
            foreach ($seasons as $season) {
                foreach ($leagues as $league) {
                    $pairs[] = $league.':'.$season;
                }
            }
            $pairs = implode(',', $pairs);
        }
        $competitions = CompetitionConfig::configured($pairs);
        usort($competitions, fn ($a, $b): int => [$a->season, $a->leagueId] <=> [$b->season, $b->leagueId]);

        return $competitions;
    }
}
