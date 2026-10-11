<?php

namespace App\Services\Apis;

use RuntimeException;

class FootballApiBudgetExceeded extends RuntimeException
{
    public function __construct(public readonly bool $attempted)
    {
        parent::__construct('API Football request budget exhausted; retry later.');
    }
}
