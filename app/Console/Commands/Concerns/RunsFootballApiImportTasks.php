<?php

namespace App\Console\Commands\Concerns;

trait RunsFootballApiImportTasks
{
    protected function runFootballApiImport(
        string $startMessage,
        string $storeTaskDescription,
        callable $fetchData,
        callable $storeData,
        string $doneMessage,
        bool $storeWhenEmpty = false,
    ): int {
        $this->info($startMessage);
        $data = [];

        $this->components->task('Data uit API ophalen', function () use (&$data, $fetchData) {
            $data = $fetchData();
        });

        $this->components->task($storeTaskDescription, function () use ($data, $storeData, $storeWhenEmpty) {
            if ($storeWhenEmpty || ! empty($data)) {
                $storeData($data);
            }
        });

        $this->info($doneMessage);

        return self::SUCCESS;
    }

    protected function runDatabaseSyncTask(
        string $startMessage,
        string $taskDescription,
        callable $sync,
        string $doneMessage,
    ): int {
        $this->info($startMessage);

        $this->components->task($taskDescription, $sync);

        $this->info($doneMessage);

        return self::SUCCESS;
    }
}
