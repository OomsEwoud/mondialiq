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
            $this->updateOrCreatePlayer($stat);
        }
    }

    private function updateOrCreatePlayer(array $stat): void
    {
        if (! isset($stat['player']['id']) || ! isset($stat['statistics'])) {
            return;
        }

        $playerId = $this->getPlayerIds()[$stat['player']['id']] ?? null;

        if (! $playerId) {
            return;
        }

        foreach ($stat['statistics'] as $playerData) {
            $leagueId = $this->getLeagues()[$playerData['league']['id'] ?? null] ?? null;
            $teamId = $this->getTeams()[$playerData['team']['id'] ?? null] ?? null;

            if (! $leagueId || ! $teamId) {
                continue;
            }

            PlayerSeasonStat::query()->updateOrCreate(
                [
                    'player_id' => $playerId,
                    'league_id' => $leagueId,
                    'season'    => $playerData['league']['season'],
                ],
                [
                    'team_id'                 => $teamId,
                    'appearances'             => $playerData['games']['appearences'] ?? 0,
                    'total_minutes'           => $playerData['games']['minutes'] ?? 0,
                    'position'                => $playerData['games']['position'] ?? null,
                    'rating'                  => $playerData['games']['rating'] ?? null,
                    'is_captain'              => $playerData['games']['captain'] ?? false,
                    'substitutes_in'          => $playerData['substitutes']['in'] ?? 0,
                    'substitutes_out'         => $playerData['substitutes']['out'] ?? 0,
                    'bench'                   => $playerData['substitutes']['bench'] ?? 0,
                    'total_shots'             => $playerData['shots']['total'] ?? 0,
                    'shots_on_target'         => $playerData['shots']['on'] ?? 0,
                    'total_goals'             => $playerData['goals']['total'] ?? 0,
                    'total_goals_conceded'    => $playerData['goals']['conceded'] ?? 0,
                    'total_assists'           => $playerData['goals']['assists'] ?? 0,
                    'total_saves'             => $playerData['goals']['saves'] ?? 0,
                    'total_passes'            => $playerData['passes']['total'] ?? 0,
                    'key_passes'              => $playerData['passes']['key'] ?? 0,
                    'pass_accuracy'           => $playerData['passes']['accuracy'] ?? 0,
                    'total_tackles'           => $playerData['tackles']['total'] ?? 0,
                    'total_blocks'            => $playerData['tackles']['blocks'] ?? 0,
                    'total_interceptions'     => $playerData['tackles']['interceptions'] ?? 0,
                    'total_duels'             => $playerData['duels']['total'] ?? 0,
                    'duels_won'               => $playerData['duels']['won'] ?? 0,
                    'total_dribbles_attempts' => $playerData['dribbles']['attempts'] ?? 0,
                    'dribbles_success'        => $playerData['dribbles']['success'] ?? 0,
                    'dribbles_past'           => $playerData['dribbles']['past'] ?? 0,
                    'fouls_drawn'             => $playerData['fouls']['drawn'] ?? 0,
                    'fouls_committed'         => $playerData['fouls']['committed'] ?? 0,
                    'yellow_cards'            => $playerData['cards']['yellow'] ?? 0,
                    'yellow_red_cards'        => $playerData['cards']['yellowred'] ?? 0,
                    'red_cards'               => $playerData['cards']['red'] ?? 0,
                    'penalties_won'           => $playerData['penalty']['won'] ?? 0,
                    'penalties_committed'     => $playerData['penalty']['commited'] ?? 0, // 'commited' met één m, zoals in API
                    'penalties_scored'        => $playerData['penalty']['scored'] ?? 0,
                    'penalties_missed'        => $playerData['penalty']['missed'] ?? 0,
                    'penalties_saved'         => $playerData['penalty']['saved'] ?? 0,
                ],
            );
        }
    }
}
