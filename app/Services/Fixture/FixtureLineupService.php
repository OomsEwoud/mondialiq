<?php

namespace App\Services\Fixture;
use App\Models\Fixture;
use App\Models\Team;
use App\Models\Player;
use App\Models\FixturePlayer;


class FixtureLineupService
{
    public function storeLineups(array $lineupData, int $fixtureId): void
    {
        foreach ($lineupData as $data) {
            $teamId = Team::where('external_id', $data['team']['id'])->value('id');
            if (!$teamId) continue;

            $fixture = Fixture::find($fixtureId);
            $fixture->lineups()->syncWithoutDetaching([
                $teamId => ['formation' => $data['formation']]
            ]);

            $this->storePlayers($data['startXI'], $fixtureId, $teamId, true);
            $this->storePlayers($data['substitutes'], $fixtureId, $teamId, false);
        }
    }

    private function storePlayers(array $players, int $fixtureId, int $teamId, bool $isStarting): void
    {
        foreach ($players as $entry) {
            $playerData = $entry['player'];

            $playerId = Player::where('external_id', $playerData['id'])->value('id');
            if (!$playerId) continue;

            FixturePlayer::updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'player_id'  => $playerId,
                ],
                [
                    'team_id'       => $teamId,
                    'is_starting'   => $isStarting,
                    'jersey_number' => $playerData['number'],
                    'position'      => $playerData['pos'], 
                ]
            );
        }
    }
}