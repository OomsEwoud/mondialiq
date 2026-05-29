<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\MissingPlayer;
use App\Models\Player;
use Illuminate\Support\Collection;

class MissingPlayerService
{
    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    public function storeMissingPlayers(array $missingPlayers): array
    {
        if ($missingPlayers === []) {
            return $this->emptySummary();
        }

        $fixtureIds = Fixture::query()
            ->whereIn('external_id', $this->extractIds($missingPlayers, 'fixture.id'))
            ->pluck('id', 'external_id');

        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractIds($missingPlayers, 'player.id'))
            ->pluck('id', 'external_id');

        $summary = $this->emptySummary(count($missingPlayers));

        foreach ($missingPlayers as $missingPlayerData) {
            $fixtureId = $fixtureIds[data_get($missingPlayerData, 'fixture.id')] ?? null;
            $playerId = $playerIds[data_get($missingPlayerData, 'player.id')] ?? null;

            if ($fixtureId === null || $playerId === null) {
                $summary['skipped']++;

                continue;
            }

            $missingPlayer = MissingPlayer::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'player_id' => $playerId,
                ],
                [
                    'type' => data_get($missingPlayerData, 'player.type'),
                    'reason' => data_get($missingPlayerData, 'player.reason'),
                ],
            );

            $summary = $this->recordStoredModel($summary, $missingPlayer);
        }

        return $summary;
    }

    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    private function emptySummary(int $processed = 0): array
    {
        return [
            'processed' => $processed,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];
    }

    /**
     * @param  array{processed: int, created: int, updated: int, skipped: int}  $summary
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    private function recordStoredModel(array $summary, MissingPlayer $missingPlayer): array
    {
        if ($missingPlayer->wasRecentlyCreated) {
            $summary['created']++;

            return $summary;
        }

        if ($missingPlayer->wasChanged()) {
            $summary['updated']++;
        }

        return $summary;
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function extractIds(array $items, string $path): Collection
    {
        return collect($items)
            ->pluck($path)
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }
}
