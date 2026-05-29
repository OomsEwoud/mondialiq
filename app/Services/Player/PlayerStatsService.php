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
        $playerId = $this->localPlayerId($stat);
        $statistics = data_get($stat, 'statistics', []);

        if ($playerId === null || ! is_iterable($statistics)) {
            return;
        }

        foreach ($statistics as $playerData) {
            $leagueId = $this->localLeagueId($playerData);
            $teamId = $this->localTeamId($playerData);

            if ($leagueId === null || $teamId === null) {
                continue;
            }

            PlayerSeasonStat::query()->updateOrCreate(
                $this->seasonStatIdentity($playerId, $leagueId, $playerData),
                $this->seasonStatAttributes($teamId, $playerData),
            );
        }
    }

    private function localPlayerId(array $stat): ?int
    {
        $externalPlayerId = data_get($stat, 'player.id');

        if (! is_numeric($externalPlayerId)) {
            return null;
        }

        $playerId = $this->getPlayerIds()[(int) $externalPlayerId] ?? null;

        return is_numeric($playerId) ? (int) $playerId : null;
    }

    private function localLeagueId(array $playerData): ?int
    {
        $externalLeagueId = data_get($playerData, 'league.id');

        if (! is_numeric($externalLeagueId)) {
            return null;
        }

        $leagueId = $this->getLeagues()[(int) $externalLeagueId] ?? null;

        return is_numeric($leagueId) ? (int) $leagueId : null;
    }

    private function localTeamId(array $playerData): ?int
    {
        $externalTeamId = data_get($playerData, 'team.id');

        if (! is_numeric($externalTeamId)) {
            return null;
        }

        $teamId = $this->getTeams()[(int) $externalTeamId] ?? null;

        return is_numeric($teamId) ? (int) $teamId : null;
    }

    /**
     * @return array{player_id: int, league_id: int, season: int}
     */
    private function seasonStatIdentity(int $playerId, int $leagueId, array $playerData): array
    {
        return [
            'player_id' => $playerId,
            'league_id' => $leagueId,
            'season' => $playerData['league']['season'],
        ];
    }

    /**
     * @return array<string, bool|float|int|string|null>
     */
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

    /**
     * @return array{appearances: mixed, total_minutes: mixed, position: mixed, rating: mixed, is_captain: mixed}
     */
    private function gameAttributes(array $playerData): array
    {
        return [
            'appearances' => $playerData['games']['appearences'] ?? 0,
            'total_minutes' => $playerData['games']['minutes'] ?? 0,
            'position' => $playerData['games']['position'] ?? null,
            'rating' => $playerData['games']['rating'] ?? null,
            'is_captain' => $playerData['games']['captain'] ?? false,
        ];
    }

    /**
     * @return array{substitutes_in: mixed, substitutes_out: mixed, bench: mixed}
     */
    private function substituteAttributes(array $playerData): array
    {
        return [
            'substitutes_in' => $playerData['substitutes']['in'] ?? 0,
            'substitutes_out' => $playerData['substitutes']['out'] ?? 0,
            'bench' => $playerData['substitutes']['bench'] ?? 0,
        ];
    }

    /**
     * @return array{total_shots: mixed, shots_on_target: mixed}
     */
    private function shotAttributes(array $playerData): array
    {
        return [
            'total_shots' => $playerData['shots']['total'] ?? 0,
            'shots_on_target' => $playerData['shots']['on'] ?? 0,
        ];
    }

    /**
     * @return array{total_goals: mixed, total_goals_conceded: mixed, total_assists: mixed, total_saves: mixed}
     */
    private function goalAttributes(array $playerData): array
    {
        return [
            'total_goals' => $playerData['goals']['total'] ?? 0,
            'total_goals_conceded' => $playerData['goals']['conceded'] ?? 0,
            'total_assists' => $playerData['goals']['assists'] ?? 0,
            'total_saves' => $playerData['goals']['saves'] ?? 0,
        ];
    }

    /**
     * @return array{total_passes: mixed, key_passes: mixed, pass_accuracy: mixed}
     */
    private function passingAttributes(array $playerData): array
    {
        return [
            'total_passes' => $playerData['passes']['total'] ?? 0,
            'key_passes' => $playerData['passes']['key'] ?? 0,
            'pass_accuracy' => $playerData['passes']['accuracy'] ?? 0,
        ];
    }

    /**
     * @return array{total_tackles: mixed, total_blocks: mixed, total_interceptions: mixed}
     */
    private function defensiveAttributes(array $playerData): array
    {
        return [
            'total_tackles' => $playerData['tackles']['total'] ?? 0,
            'total_blocks' => $playerData['tackles']['blocks'] ?? 0,
            'total_interceptions' => $playerData['tackles']['interceptions'] ?? 0,
        ];
    }

    /**
     * @return array{total_duels: mixed, duels_won: mixed, total_dribbles_attempts: mixed, dribbles_success: mixed, dribbles_past: mixed}
     */
    private function duelAttributes(array $playerData): array
    {
        return [
            'total_duels' => $playerData['duels']['total'] ?? 0,
            'duels_won' => $playerData['duels']['won'] ?? 0,
            'total_dribbles_attempts' => $playerData['dribbles']['attempts'] ?? 0,
            'dribbles_success' => $playerData['dribbles']['success'] ?? 0,
            'dribbles_past' => $playerData['dribbles']['past'] ?? 0,
        ];
    }

    /**
     * @return array{fouls_drawn: mixed, fouls_committed: mixed, yellow_cards: mixed, yellow_red_cards: mixed, red_cards: mixed}
     */
    private function disciplineAttributes(array $playerData): array
    {
        return [
            'fouls_drawn' => $playerData['fouls']['drawn'] ?? 0,
            'fouls_committed' => $playerData['fouls']['committed'] ?? 0,
            'yellow_cards' => $playerData['cards']['yellow'] ?? 0,
            'yellow_red_cards' => $playerData['cards']['yellowred'] ?? 0,
            'red_cards' => $playerData['cards']['red'] ?? 0,
        ];
    }

    /**
     * @return array{penalties_won: mixed, penalties_committed: mixed, penalties_scored: mixed, penalties_missed: mixed, penalties_saved: mixed}
     */
    private function penaltyAttributes(array $playerData): array
    {
        return [
            'penalties_won' => $playerData['penalty']['won'] ?? 0,
            'penalties_committed' => $playerData['penalty']['commited'] ?? 0,
            'penalties_scored' => $playerData['penalty']['scored'] ?? 0,
            'penalties_missed' => $playerData['penalty']['missed'] ?? 0,
            'penalties_saved' => $playerData['penalty']['saved'] ?? 0,
        ];
    }
}
