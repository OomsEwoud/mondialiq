<?php

namespace App\Services\Apis;

class FootballApiContext
{
    private array $callers = [];

    public function push(string $caller): void
    {
        $this->callers[] = $caller;
    }

    public function pop(): void
    {
        array_pop($this->callers);
    }

    public function caller(): string
    {
        return implode(' > ', $this->callers) ?: 'application';
    }
}
