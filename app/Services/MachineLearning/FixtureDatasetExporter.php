<?php

namespace App\Services\MachineLearning;

use Carbon\CarbonImmutable;
use Illuminate\Database\DatabaseManager;
use Illuminate\Filesystem\Filesystem;
use RuntimeException;

class FixtureDatasetExporter
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly Filesystem $files,
    ) {}

    public function export(string $kickoffTimezone): string
    {
        $directory = storage_path('app/private/ml');
        $this->files->ensureDirectoryExists($directory, 0700);
        $path = $directory.'/fixtures-'.CarbonImmutable::now('UTC')->format('Ymd-His-u').'.jsonl';
        $stream = fopen($path, 'xb');

        if ($stream === false) {
            throw new RuntimeException('Cannot create ML export.');
        }

        try {
            $this->write($stream, [
                'schema_version' => 1,
                'exported_at' => CarbonImmutable::now('UTC')->toIso8601String(),
                'kickoff_timezone' => $kickoffTimezone,
                'availability_policy' => 'latest-recorded-state-v1',
            ]);

            $fixtures = $this->database->table('fixtures')->select([
                'id', 'external_id', 'league_id', 'season', 'home_team_id', 'away_team_id',
                'match_date', 'status_short', 'fulltime_home_goals', 'fulltime_away_goals',
                'created_at', 'updated_at', 'fixture_basics_synced_at',
            ])->orderBy('match_date')->orderBy('id')->cursor();

            $count = 0;
            $hash = hash_init('sha256');
            $teams = $leagues = $seasons = $seen = [];
            $first = $last = null;

            foreach ($fixtures as $fixture) {
                $row = (array) $fixture;
                $row['kickoff'] = CarbonImmutable::parse($fixture->match_date, $kickoffTimezone)
                    ->utc()->toIso8601String();
                unset($row['match_date']);
                if ($fixture->external_id !== null && isset($seen[$fixture->external_id])) {
                    throw new RuntimeException('Duplicate provider fixture ID; export aborted.');
                }
                $seen[$fixture->external_id] = true;
                if ($last !== null && $row['kickoff'] < $last) {
                    throw new RuntimeException('Nonchronological UTC kickoffs; verify storage timezone.');
                }
                $first ??= $row['kickoff'];
                $last = $row['kickoff'];
                $teams[$fixture->home_team_id] = $teams[$fixture->away_team_id] = true;
                $leagues[$fixture->league_id] = $seasons[$fixture->season] = true;

                foreach (['created_at', 'updated_at', 'fixture_basics_synced_at'] as $field) {
                    $row[$field] = $row[$field] === null ? null
                        : CarbonImmutable::parse($row[$field], 'UTC')->toIso8601String();
                }

                $this->write($stream, $row);
                hash_update($hash, json_encode($row, JSON_THROW_ON_ERROR)."\n");
                $count++;
            }

            $this->write($stream, ['export_complete' => true, 'row_count' => $count]);
            fflush($stream);
            $summary = ['fixtures' => $count, 'leagues' => count($leagues), 'seasons' => count($seasons), 'teams' => count($teams),
                'first_kickoff' => $first, 'last_kickoff' => $last, 'dataset_rows_sha256' => hash_final($hash),
                'sha256' => hash_file('sha256', $path), 'bytes' => filesize($path),
                'fingerprint_contract' => 'sha256 of chronological JSON rows plus LF, excludes header/footer',
                'provenance' => $this->database->getSchemaBuilder()->hasTable('ml_import_batches')
                    ? $this->database->table('ml_import_batches')->orderBy('id')->get(['id', 'provider_league_id', 'season', 'provider', 'endpoint', 'schema_version', 'payload_sha256', 'fetched_at', 'completed_at'])->all() : [],
            ];
            $this->files->put($path.'.summary.json', json_encode($summary, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
        } finally {
            fclose($stream);
        }

        return $path;
    }

    /** @param resource $stream */
    private function write($stream, array $row): void
    {
        $line = json_encode($row, JSON_THROW_ON_ERROR).PHP_EOL;

        if (fwrite($stream, $line) !== strlen($line)) {
            throw new RuntimeException('Cannot complete ML export.');
        }
    }
}
