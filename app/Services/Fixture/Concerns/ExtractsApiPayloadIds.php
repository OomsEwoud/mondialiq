<?php

namespace App\Services\Fixture\Concerns;

use Illuminate\Support\Collection;

trait ExtractsApiPayloadIds
{
    private function extractNumericIds(array $items, string $path): Collection
    {
        return $this->normalizeNumericIds(collect($items)->pluck($path));
    }

    private function normalizeNumericIds(Collection $values): Collection
    {
        return $values
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }

    private function localIdForExternalId(Collection $localIdsByExternalId, mixed $externalId): ?int
    {
        if (! is_numeric($externalId)) {
            return null;
        }

        $localId = $localIdsByExternalId[(int) $externalId] ?? null;

        return is_numeric($localId) ? (int) $localId : null;
    }
}
