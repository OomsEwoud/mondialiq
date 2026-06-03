<?php

namespace App\Console\Commands\Concerns;

use Symfony\Component\Console\Command\Command;

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
            if ($this->shouldStoreImportData($data, $storeWhenEmpty)) {
                $storeData($data);
            }
        });

        $this->info($doneMessage);

        return Command::SUCCESS;
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

        return Command::SUCCESS;
    }

    private function shouldStoreImportData(array $data, bool $storeWhenEmpty): bool
    {
        return $storeWhenEmpty || $data !== [];
    }
}
