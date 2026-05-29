<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Coach\CoachService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-coaches')]
#[Description('Synchroniseer coaches vanuit de Football API')]
class AddCoaches extends Command
{
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly CoachService $coachService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runDatabaseSyncTask(
            'Ophalen van coaches',
            'Opslaan van coaches in database',
            function (): void {
                $this->coachService->syncCoaches();
            },
            'Coaches klaar',
        );
    }
}
