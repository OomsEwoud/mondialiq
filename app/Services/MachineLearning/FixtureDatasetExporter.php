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
            ])->orderBy('id')->cursor();

            $count = 0;

            foreach ($fixtures as $fixture) {
                $row = (array) $fixture;
                $row['kickoff'] = CarbonImmutable::parse($fixture->match_date, $kickoffTimezone)
                    ->utc()->toIso8601String();
                unset($row['match_date']);

                foreach (['created_at', 'updated_at', 'fixture_basics_synced_at'] as $field) {
                    $row[$field] = $row[$field] === null ? null
                        : CarbonImmutable::parse($row[$field], 'UTC')->toIso8601String();
                }

                $this->write($stream, $row);
                $count++;
            }

            $this->write($stream, ['export_complete' => true, 'row_count' => $count]);
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
