<?php

namespace App\Console\Commands;

use App\Services\Coach\CoachService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-coaches')]
#[Description('Command description')]
class AddCoaches extends Command
{
    public function __construct(protected CoachService $coachService) 
    {
        parent::__construct();
    }

    public function handle()
    {
        $this->coachService->syncCoaches();
    }
}
