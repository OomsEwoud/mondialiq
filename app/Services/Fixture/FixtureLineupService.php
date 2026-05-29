<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\FixturePlayer;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Support\Collection;

class FixtureLineupService
{
    use ExtractsApiPayloadIds;

    public function storeLineups(array $lineupData, int $fixtureId): void
    {
        $fixture = Fixture::query()->find($fixtureId);

        if (! $fixture) {
            return;
        }

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($lineupData, 'team.id'))
            ->pluck('id', 'external_id');
        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractPlayerIds($lineupData))
            ->pluck('id', 'external_id');

        foreach ($lineupData as $data) {
            $teamId = $teamIds[data_get($data, 'team.id')] ?? null;
            $formation = data_get($data, 'formation');

            if (! $teamId || ! is_string($formation) || $formation === '') {
                continue;
            }

            $fixture->lineups()->syncWithoutDetaching([
                $teamId => ['formation' => $formation],
            ]);

            $this->storePlayers(
                data_get($data, 'startXI', []),
                $fixtureId,
                $teamId,
                $playerIds,
                true,
            );
            $this->storePlayers(
                data_get($data, 'substitutes', []),
                $fixtureId,
                $teamId,
                $playerIds,
                false,
            );
        }
    }

    private function storePlayers(
        array $players,
        int $fixtureId,
        int $teamId,
        Collection $playerIds,
        bool $isStarting,
    ): void {
        foreach ($players as $entry) {
            $playerData = data_get($entry, 'player', []);

            if (! is_array($playerData)) {
                continue;
            }

            $playerId = $playerIds[data_get($playerData, 'id')] ?? null;

            if (! $playerId) {
                continue;
            }

            FixturePlayer::query()->updateOrCreate(
                $this->playerIdentity($fixtureId, $playerId),
                $this->playerAttributes($playerData, $teamId, $isStarting),
            );
        }
    }

    /**
     * @return array{fixture_id: int, player_id: int}
     */
    private function playerIdentity(int $fixtureId, int $playerId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
        ];
    }

    /**
     * @return array{team_id: int, is_starting: bool, jersey_number: mixed, position: mixed}
     */
    private function playerAttributes(array $playerData, int $teamId, bool $isStarting): array
    {
        return [
            'team_id' => $teamId,
            'is_starting' => $isStarting,
            'jersey_number' => data_get($playerData, 'number'),
            'position' => data_get($playerData, 'pos'),
        ];
    }

    private function extractPlayerIds(array $lineupData): Collection
    {
        $players = collect($lineupData)
            ->flatMap(fn (array $teamData): array => [
                ...data_get($teamData, 'startXI', []),
                ...data_get($teamData, 'substitutes', []),
            ])
            ->pluck('player.id');

        return $this->normalizeNumericIds($players);
    }
}
