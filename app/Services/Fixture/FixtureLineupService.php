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

    public function storeLineups(array $lineupData, int $fixtureId): bool
    {
        $fixture = $this->fixture($fixtureId);

        if (! $fixture) {
            return false;
        }

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($lineupData, 'team.id'))
            ->pluck('id', 'external_id');
        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractPlayerIds($lineupData))
            ->pluck('id', 'external_id');

        $storedLineups = 0;

        foreach ($lineupData as $data) {
            $lineupPayload = $this->lineupPayload($data, $teamIds);

            if ($lineupPayload === null) {
                continue;
            }

            $this->storeTeamLineup($fixture, $lineupPayload);
            $storedLineups++;

            $this->storePlayers(
                $this->playerEntries(data_get($data, 'startXI', [])),
                $fixtureId,
                $lineupPayload['team_id'],
                $playerIds,
                true,
            );
            $this->storePlayers(
                $this->playerEntries(data_get($data, 'substitutes', [])),
                $fixtureId,
                $lineupPayload['team_id'],
                $playerIds,
                false,
            );
        }

        return $storedLineups > 0;
    }

    private function fixture(int $fixtureId): ?Fixture
    {
        return Fixture::query()->find($fixtureId);
    }

    private function lineupPayload(array $data, Collection $teamIds): ?array
    {
        $teamId = $teamIds[data_get($data, 'team.id')] ?? null;
        $formation = data_get($data, 'formation');

        if (! is_numeric($teamId) || ! is_string($formation) || $formation === '') {
            return null;
        }

        return [
            'team_id' => (int) $teamId,
            'formation' => $formation,
        ];
    }

    private function playerEntries(mixed $players): array
    {
        return is_array($players) ? $players : [];
    }

    private function storeTeamLineup(Fixture $fixture, array $lineupPayload): void
    {
        $fixture->lineups()->syncWithoutDetaching([
            $lineupPayload['team_id'] => ['formation' => $lineupPayload['formation']],
        ]);
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

            $playerId = $this->localPlayerId($playerData, $playerIds);

            if ($playerId === null) {
                continue;
            }

            FixturePlayer::query()->updateOrCreate(
                $this->playerIdentity($fixtureId, $playerId),
                $this->playerAttributes($playerData, $teamId, $isStarting),
            );
        }
    }

    private function localPlayerId(array $playerData, Collection $playerIds): ?int
    {
        return $this->localIdForExternalId($playerIds, data_get($playerData, 'id'));
    }

    private function playerIdentity(int $fixtureId, int $playerId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
        ];
    }

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
