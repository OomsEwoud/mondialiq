<?php

namespace App\Services\Player;

class PlayerSeasonStatAttributesMapper
{
    public function seasonStatAttributes(int $teamId, array $playerData): array
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
