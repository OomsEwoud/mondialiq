<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\FixturePlayer;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

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

        $storedLineups = 0;
        $storedPlayers = 0;

        foreach ($lineupData as $index => $data) {
            $lineupPayload = $this->lineupPayload($data, $teamIds, $fixture, $index);

            if ($lineupPayload === null) {
                continue;
            }

            if ($lineupPayload['formation'] !== null) {
                $this->storeTeamLineup($fixture, $lineupPayload);
                $storedLineups++;
            }

            $storedPlayers += $this->storePlayers(
                $this->playerEntries(data_get($data, 'startXI', [])),
                $fixtureId,
                $lineupPayload['team_id'],
                true,
            );
            $storedPlayers += $this->storePlayers(
                $this->playerEntries(data_get($data, 'substitutes', [])),
                $fixtureId,
                $lineupPayload['team_id'],
                false,
            );
        }

        return $storedLineups > 0 || $storedPlayers > 0;
    }

    private function fixture(int $fixtureId): ?Fixture
    {
        return Fixture::query()
            ->with(['homeTeam:id,external_id,name,code', 'awayTeam:id,external_id,name,code'])
            ->find($fixtureId);
    }

    private function lineupPayload(array $data, Collection $teamIds, Fixture $fixture, int $index): ?array
    {
        $teamId = $this->localTeamId($data, $teamIds, $fixture, $index);
        $formation = data_get($data, 'formation');

        if (! is_numeric($teamId)) {
            return null;
        }

        return [
            'team_id' => (int) $teamId,
            'formation' => is_string($formation) && $formation !== '' ? $formation : null,
        ];
    }

    private function localTeamId(array $data, Collection $teamIds, Fixture $fixture, int $index): ?int
    {
        $teamId = $teamIds[data_get($data, 'team.id')] ?? null;

        if (is_numeric($teamId)) {
            return (int) $teamId;
        }

        $apiTeamName = Str::of((string) data_get($data, 'team.name', ''))->lower()->trim()->toString();

        foreach ([$fixture->homeTeam, $fixture->awayTeam] as $team) {
            if (! $team) {
                continue;
            }

            if (
                $apiTeamName !== ''
                && in_array($apiTeamName, [
                    Str::of((string) $team->name)->lower()->trim()->toString(),
                    Str::of((string) $team->code)->lower()->trim()->toString(),
                ], true)
            ) {
                return $team->id;
            }
        }

        return match ($index) {
            0 => $fixture->home_team_id,
            1 => $fixture->away_team_id,
            default => null,
        };
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
        bool $isStarting,
    ): int {
        $storedPlayers = 0;

        foreach ($players as $entry) {
            $playerData = data_get($entry, 'player', []);

            if (! is_array($playerData)) {
                continue;
            }

            $playerId = $this->localPlayerId($playerData, $teamId);

            if ($playerId === null) {
                continue;
            }

            FixturePlayer::query()->updateOrCreate(
                $this->playerIdentity($fixtureId, $playerId),
                $this->playerAttributes($playerData, $teamId, $isStarting),
            );

            $storedPlayers++;
        }

        return $storedPlayers;
    }

    private function localPlayerId(array $playerData, int $teamId): ?int
    {
        $externalId = data_get($playerData, 'id');

        if (! is_numeric($externalId)) {
            return null;
        }

        $player = Player::query()->updateOrCreate(
            ['external_id' => (int) $externalId],
            $this->playerModelAttributes($playerData),
        );

        $player->teams()->syncWithoutDetaching([
            $teamId => ['is_active' => true],
        ]);

        return $player->id;
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

    private function playerModelAttributes(array $playerData): array
    {
        $attributes = [];
        $displayName = data_get($playerData, 'name');
        $number = data_get($playerData, 'number');
        $position = data_get($playerData, 'pos');

        if (is_string($displayName) && $displayName !== '') {
            $attributes['display_name'] = $displayName;
        }

        if (is_numeric($number)) {
            $attributes['number'] = (int) $number;
        }

        if (is_string($position) && $position !== '') {
            $attributes['position'] = $position;
        }

        return $attributes;
    }
}
