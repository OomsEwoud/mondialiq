<?php

namespace App\Services\Fixture;

use App\Models\Player;
use App\Models\PlayerFixtureStat;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class FixturePlayerStatsService
{
    use ExtractsApiPayloadIds;

    public function __construct(
        private readonly FixturePlayerStatsAttributesMapper $attributesMapper,
    ) {}

    public function storeFixturePlayerStats(array $teamPlayerStats, int $fixtureId): array
    {
        if ($teamPlayerStats === []) {
            return $this->emptySummary();
        }

        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractPlayerIds($teamPlayerStats))
            ->pluck('id', 'external_id');

        $summary = $this->emptySummary();

        foreach ($teamPlayerStats as $teamData) {
            foreach ($this->playersFromTeamStats($teamData) as $playerData) {
                $summary['processed']++;
                $localPlayerId = $this->localPlayerId($playerData, $playerIds);

                if ($localPlayerId === null) {
                    $summary['skipped']++;

                    continue;
                }

                $attributes = $this->attributesMapper->mapStats($playerData, $fixtureId, $localPlayerId);

                $playerFixtureStat = PlayerFixtureStat::query()->updateOrCreate(
                    $this->playerFixtureStatIdentity($fixtureId, $localPlayerId),
                    $attributes,
                );

                $summary = $this->recordStoredModel($summary, $playerFixtureStat);
            }
        }

        return $summary;
    }

    private function playersFromTeamStats(array $teamData): array
    {
        $players = data_get($teamData, 'players', []);

        return is_array($players) ? $players : [];
    }

    private function localPlayerId(array $playerData, Collection $playerIds): ?int
    {
        return $this->localIdForExternalId($playerIds, data_get($playerData, 'player.id'));
    }

    private function playerFixtureStatIdentity(int $fixtureId, int $playerId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
        ];
    }

    private function emptySummary(): array
    {
        return [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];
    }

    private function recordStoredModel(array $summary, Model $model): array
    {
        if ($model->wasRecentlyCreated) {
            $summary['created']++;

            return $summary;
        }

        if ($model->wasChanged()) {
            $summary['updated']++;
        }

        return $summary;
    }

    private function extractPlayerIds(array $teamPlayerStats): Collection
    {
        $playerIds = collect($teamPlayerStats)
            ->pluck('players')
            ->flatten(1)
            ->pluck('player.id');

        return $this->normalizeNumericIds($playerIds);
    }
}
