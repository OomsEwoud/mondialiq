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
                $this->seasonStatAttributes($teamId, $playerData),
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

    private function seasonStatAttributes(int $teamId, array $playerData): array
    {
        return [
            'team_id' => $teamId,
            ...$this->gameAttributes($playerData),
            ...$this->substituteAttributes($playerData),
            ...$this->shotAttributes($playerData),
            ...$this->goalAttributes($playerData),
            ...$this->passingAttributes($playerData),
            ...$this->defensiveAttributes($playerData),
            ...$this->duelAttributes($playerData),
            ...$this->disciplineAttributes($playerData),
            ...$this->penaltyAttributes($playerData),
        ];
    }

    private function gameAttributes(array $playerData): array
    {
        return [
            'appearances' => data_get($playerData, 'games.appearences', 0),
            'total_minutes' => data_get($playerData, 'games.minutes', 0),
            'position' => data_get($playerData, 'games.position'),
            'rating' => data_get($playerData, 'games.rating'),
            'is_captain' => data_get($playerData, 'games.captain', false),
        ];
    }

    private function substituteAttributes(array $playerData): array
    {
        return [
            'substitutes_in' => data_get($playerData, 'substitutes.in', 0),
            'substitutes_out' => data_get($playerData, 'substitutes.out', 0),
            'bench' => data_get($playerData, 'substitutes.bench', 0),
        ];
    }

    private function shotAttributes(array $playerData): array
    {
        return [
            'total_shots' => data_get($playerData, 'shots.total', 0),
            'shots_on_target' => data_get($playerData, 'shots.on', 0),
        ];
    }

    private function goalAttributes(array $playerData): array
    {
        return [
            'total_goals' => data_get($playerData, 'goals.total', 0),
            'total_goals_conceded' => data_get($playerData, 'goals.conceded', 0),
            'total_assists' => data_get($playerData, 'goals.assists', 0),
            'total_saves' => data_get($playerData, 'goals.saves', 0),
        ];
    }

    private function passingAttributes(array $playerData): array
    {
        return [
            'total_passes' => data_get($playerData, 'passes.total', 0),
            'key_passes' => data_get($playerData, 'passes.key', 0),
            'pass_accuracy' => data_get($playerData, 'passes.accuracy', 0),
        ];
    }

    private function defensiveAttributes(array $playerData): array
    {
        return [
            'total_tackles' => data_get($playerData, 'tackles.total', 0),
            'total_blocks' => data_get($playerData, 'tackles.blocks', 0),
            'total_interceptions' => data_get($playerData, 'tackles.interceptions', 0),
        ];
    }

    private function duelAttributes(array $playerData): array
    {
        return [
            'total_duels' => data_get($playerData, 'duels.total', 0),
            'duels_won' => data_get($playerData, 'duels.won', 0),
            'total_dribbles_attempts' => data_get($playerData, 'dribbles.attempts', 0),
            'dribbles_success' => data_get($playerData, 'dribbles.success', 0),
            'dribbles_past' => data_get($playerData, 'dribbles.past', 0),
        ];
    }

    private function disciplineAttributes(array $playerData): array
    {
        return [
            'fouls_drawn' => data_get($playerData, 'fouls.drawn', 0),
            'fouls_committed' => data_get($playerData, 'fouls.committed', 0),
            'yellow_cards' => data_get($playerData, 'cards.yellow', 0),
            'yellow_red_cards' => data_get($playerData, 'cards.yellowred', 0),
            'red_cards' => data_get($playerData, 'cards.red', 0),
        ];
    }

    private function penaltyAttributes(array $playerData): array
    {
        return [
            'penalties_won' => data_get($playerData, 'penalty.won', 0),
            'penalties_committed' => data_get($playerData, 'penalty.commited', 0),
            'penalties_scored' => data_get($playerData, 'penalty.scored', 0),
            'penalties_missed' => data_get($playerData, 'penalty.missed', 0),
            'penalties_saved' => data_get($playerData, 'penalty.saved', 0),
        ];
    }
}
