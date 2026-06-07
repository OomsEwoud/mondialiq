<?php

namespace App\Services\Player;

use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Team;
use Illuminate\Support\Collection;

class PlayerStatsService
{
    private ?Collection $leagues = null;

    private ?Collection $teams = null;

    private ?Collection $playerIds = null;

    public function __construct(
        private readonly PlayerSeasonStatAttributesMapper $attributesMapper,
    ) {}

    private function getLeagues(): Collection
    {
        return $this->leagues ??= League::query()->pluck('id', 'external_id');
    }

    private function getTeams(): Collection
    {
        return $this->teams ??= Team::query()->pluck('id', 'external_id');
    }

    private function getPlayerIds(): Collection
    {
        return $this->playerIds ??= Player::query()->pluck('id', 'external_id');
    }

    public function storePlayerStats(array $stats): void
    {
        foreach ($stats as $stat) {
            if (! is_array($stat)) {
                continue;
            }

            $this->updateOrCreatePlayer($stat);
        }
    }

    private function updateOrCreatePlayer(array $stat): void
    {
        $playerId = $this->localPlayerId($stat);
        $statistics = data_get($stat, 'statistics', []);

        if ($playerId === null || ! is_iterable($statistics)) {
            return;
        }

        foreach ($statistics as $playerData) {
            if (! is_array($playerData)) {
                continue;
            }

            $leagueId = $this->localLeagueId($playerData);
            $teamId = $this->localTeamId($playerData);
            $season = $this->season($playerData);

            if ($leagueId === null || $teamId === null || $season === null) {
                continue;
            }

            PlayerSeasonStat::query()->updateOrCreate(
                $this->seasonStatIdentity($playerId, $leagueId, $season),
                $this->attributesMapper->seasonStatAttributes($teamId, $playerData),
            );
        }
    }

    private function localPlayerId(array $stat): ?int
    {
        return $this->localId($this->getPlayerIds(), data_get($stat, 'player.id'));
    }

    private function localLeagueId(array $playerData): ?int
    {
        return $this->localId($this->getLeagues(), data_get($playerData, 'league.id'));
    }

    private function localTeamId(array $playerData): ?int
    {
        return $this->localId($this->getTeams(), data_get($playerData, 'team.id'));
    }

    private function localId(Collection $localIdsByExternalId, mixed $externalId): ?int
    {
        if (! is_numeric($externalId)) {
            return null;
        }

        $localId = $localIdsByExternalId[(int) $externalId] ?? null;

        return is_numeric($localId) ? (int) $localId : null;
    }

    private function season(array $playerData): ?int
    {
        $season = data_get($playerData, 'league.season');

        return is_numeric($season) ? (int) $season : null;
    }

    private function seasonStatIdentity(int $playerId, int $leagueId, int $season): array
    {
        return [
            'player_id' => $playerId,
            'league_id' => $leagueId,
            'season' => $season,
        ];
    }
}
