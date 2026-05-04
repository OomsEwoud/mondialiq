<?php

namespace App\Services\Bookmaker;

use App\Models\Bookmaker;

class BookmakerService
{
    public function storeBookmakers(array $bookmakers): void
    {
        foreach ($bookmakers as $bookmaker) {

            if (empty($bookmaker['name'])) {
                continue;
            }

            Bookmaker::updateOrCreate(
                ['name' => $bookmaker['name']],
                ['name' => $bookmaker['name']]
            );
        }
    }
}
