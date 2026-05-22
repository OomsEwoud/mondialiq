<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\FixturePlayer;
use App\Models\Player;
use App\Models\Team;

class FixtureLineupService
{
    public function storeLineups(array $lineupData, int $fixtureId): void
    {
        $fixture = Fixture::query()->find($fixtureId);

        if (! $fixture) {
            return;
        }

        foreach ($lineupData as $data) {
            $teamId = Team::query()->where('external_id', data_get($data, 'team.id'))->value('id');
            $formation = data_get($data, 'formation');

            if (! $teamId || ! is_string($formation) || $formation === '') {
                continue;
            }

            $fixture->lineups()->syncWithoutDetaching([
                $teamId => ['formation' => $formation],
            ]);

            $this->storePlayers(data_get($data, 'startXI', []), $fixtureId, $teamId, true);
            $this->storePlayers(data_get($data, 'substitutes', []), $fixtureId, $teamId, false);
        }
    }

    private function storePlayers(array $players, int $fixtureId, int $teamId, bool $isStarting): void
    {
        foreach ($players as $entry) {
            $playerData = data_get($entry, 'player', []);

            if (! is_array($playerData)) {
                continue;
            }

            $playerId = Player::query()->where('external_id', data_get($playerData, 'id'))->value('id');

            if (! $playerId) {
                continue;
            }

            FixturePlayer::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'player_id' => $playerId,
                ],
                [
                    'team_id' => $teamId,
                    'is_starting' => $isStarting,
                    'jersey_number' => data_get($playerData, 'number'),
                    'position' => data_get($playerData, 'pos'),
                ],
            );
        }
    }
}
