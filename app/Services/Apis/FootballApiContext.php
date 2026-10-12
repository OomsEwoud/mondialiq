<?php

namespace App\Services\Apis;

class FootballApiContext
{
    private array $callers = [];

    private array $priorities = [];

    public function withPriority(ApiPriority $priority, callable $callback): mixed
    {
        $this->priorities[] = $priority;
        try {
            return $callback();
        } finally {
            array_pop($this->priorities);
        }
    }

    public function priority(string $endpoint, array $params): ApiPriority
    {
        if (str_contains($this->caller(), 'app:seed-historical-season')) {
            return ApiPriority::Background;
        }

        return end($this->priorities) ?: ApiPriority::forEndpoint($endpoint, $params);
    }

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
