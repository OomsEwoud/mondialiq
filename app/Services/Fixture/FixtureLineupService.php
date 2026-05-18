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
        foreach ($lineupData as $data) {
            $teamId = Team::query()->where('external_id', $data['team']['id'])->value('id');

            if (! $teamId) {
                continue;
            }

            $fixture = Fixture::query()->find($fixtureId);
            $fixture->lineups()->syncWithoutDetaching([
                $teamId => ['formation' => $data['formation']],
            ]);

            $this->storePlayers($data['startXI'], $fixtureId, $teamId, true);
            $this->storePlayers($data['substitutes'], $fixtureId, $teamId, false);
        }
    }

    private function storePlayers(array $players, int $fixtureId, int $teamId, bool $isStarting): void
    {
        foreach ($players as $entry) {
            $playerData = $entry['player'];

            $playerId = Player::query()->where('external_id', $playerData['id'])->value('id');

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
                    'jersey_number' => $playerData['number'],
                    'position' => $playerData['pos'],
                ],
            );
        }
    }
}
