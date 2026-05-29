<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\MissingPlayer;
use App\Models\Player;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;

class MissingPlayerService
{
    use ExtractsApiPayloadIds;

    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    public function storeMissingPlayers(array $missingPlayers): array
    {
        if ($missingPlayers === []) {
            return $this->emptySummary();
        }

        $fixtureIds = Fixture::query()
            ->whereIn('external_id', $this->extractNumericIds($missingPlayers, 'fixture.id'))
            ->pluck('id', 'external_id');

        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractNumericIds($missingPlayers, 'player.id'))
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
                $this->missingPlayerIdentity($fixtureId, $playerId),
                $this->missingPlayerAttributes($missingPlayerData),
            );

            $summary = $this->recordStoredModel($summary, $missingPlayer);
        }

        return $summary;
    }

    /**
     * @return array{fixture_id: int, player_id: int}
     */
    private function missingPlayerIdentity(int $fixtureId, int $playerId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
        ];
    }

    /**
     * @return array{type: mixed, reason: mixed}
     */
    private function missingPlayerAttributes(array $missingPlayerData): array
    {
        return [
            'type' => data_get($missingPlayerData, 'player.type'),
            'reason' => data_get($missingPlayerData, 'player.reason'),
        ];
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
}
