<?php

namespace App\Services\Prediction;

class PromptFormatter
{
    public function value(mixed $value): string
    {
        if ($value === null || $value === '') {
            return 'not available';
        }

        return (string) $value;
    }

    public function percentage(mixed $value, bool $round = false): string
    {
        if ($value === null || $value === '') {
            return 'not available';
        }

        $formatted = $round
            ? (string) round((float) $value)
            : $this->number($value);

        return "{$formatted}%";
    }

    public function number(mixed $value): string
    {
        $formatted = number_format((float) $value, 2, '.', '');

        return rtrim(rtrim($formatted, '0'), '.');
    }

    public function teamName(?string $teamName, string $fallback = 'Unknown team'): string
    {
        return $teamName ?? $fallback;
    }

    public function bullet(string $line): string
    {
        return "- {$line}";
    }
}
