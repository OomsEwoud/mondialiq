<?php

namespace App\Console\Commands;

use App\Models\Bookmaker;
use App\Services\Apis\FootballApiService;
use App\Services\Bookmaker\BookmakerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-bookmakers')]
#[Description('Command description')]
class AddBookmakers extends Command
{
    public function __construct(protected FootballApiService $api, protected BookmakerService $service)
    {
        parent::__construct();
    }
    public function handle()
    {
        $bookmakers = $this->api->getBookmakers();
        $this->service->storeBookmakers($bookmakers);
    }
}
