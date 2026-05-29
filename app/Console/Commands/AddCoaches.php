<?php

namespace App\Console\Commands;

use App\Services\Coach\CoachService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-coaches')]
#[Description('Synchroniseer coaches vanuit de Football API')]
class AddCoaches extends Command
{
    public function __construct(
        private readonly CoachService $coachService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van coaches');

        $this->components->task('Opslaan van coaches in database', function () {
            $this->coachService->syncCoaches();
        });

        $this->info('Coaches klaar');

        return self::SUCCESS;
    }
}
