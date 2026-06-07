<?php

namespace App\Services\Fixture;

class FixturePlayerStatsAttributesMapper
{
    public function mapStats(array $playerData, int $fixtureId, int $playerId): array
    {
        $statistics = data_get($playerData, 'statistics.0', []);

        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
            ...$this->gameAttributes($statistics),
            ...$this->shotAttributes($statistics),
            ...$this->goalAttributes($statistics),
            ...$this->passingAttributes($statistics),
            ...$this->defensiveAttributes($statistics),
            ...$this->duelAttributes($statistics),
            ...$this->disciplineAttributes($statistics),
            ...$this->penaltyAttributes($statistics),
        ];
    }

    private function gameAttributes(array $statistics): array
    {
        return [
            'game_minutes' => $this->toInt(data_get($statistics, 'games.minutes')),
            'number' => $this->toNullableInt(data_get($statistics, 'games.number')),
            'position' => $this->toNullableString(data_get($statistics, 'games.position')),
            'rating' => $this->toNullableFloat(data_get($statistics, 'games.rating')),
            'is_captain' => (bool) data_get($statistics, 'games.captain', false),
            'is_substitute' => (bool) data_get($statistics, 'games.substitute', false),
            'offsides' => $this->toInt(data_get($statistics, 'offsides')),
        ];
    }

    private function shotAttributes(array $statistics): array
    {
        return [
            'total_shots' => $this->toInt(data_get($statistics, 'shots.total')),
            'shots_on_target' => $this->toInt(data_get($statistics, 'shots.on')),
        ];
    }

    private function goalAttributes(array $statistics): array
    {
        return [
            'goals' => $this->toInt(data_get($statistics, 'goals.total')),
            'goals_conceded' => $this->toInt(data_get($statistics, 'goals.conceded')),
            'assists' => $this->toInt(data_get($statistics, 'goals.assists')),
            'saves' => $this->toInt(data_get($statistics, 'goals.saves')),
        ];
    }

    private function passingAttributes(array $statistics): array
    {
        return [
            'passes' => $this->toInt(data_get($statistics, 'passes.total')),
            'key_passes' => $this->toInt(data_get($statistics, 'passes.key')),
            'passes_accuracy' => $this->toFloat(data_get($statistics, 'passes.accuracy')),
        ];
    }

    private function defensiveAttributes(array $statistics): array
    {
        return [
            'tackles' => $this->toInt(data_get($statistics, 'tackles.total')),
            'blocks' => $this->toInt(data_get($statistics, 'tackles.blocks')),
            'interceptions' => $this->toInt(data_get($statistics, 'tackles.interceptions')),
        ];
    }

    private function duelAttributes(array $statistics): array
    {
        return [
            'duels' => $this->toInt(data_get($statistics, 'duels.total')),
            'duels_won' => $this->toInt(data_get($statistics, 'duels.won')),
            'dribbles_attempts' => $this->toInt(data_get($statistics, 'dribbles.attempts')),
            'dribbles_success' => $this->toInt(data_get($statistics, 'dribbles.success')),
            'dribbles_past' => $this->toInt(data_get($statistics, 'dribbles.past')),
        ];
    }

    private function disciplineAttributes(array $statistics): array
    {
        return [
            'fouls_drawn' => $this->toInt(data_get($statistics, 'fouls.drawn')),
            'fouls_committed' => $this->toInt(data_get($statistics, 'fouls.committed')),
            'yellow_cards' => $this->toInt(data_get($statistics, 'cards.yellow')),
            'red_cards' => $this->toInt(data_get($statistics, 'cards.red')),
        ];
    }

    private function penaltyAttributes(array $statistics): array
    {
        return [
            'penalties_won' => $this->toInt(data_get($statistics, 'penalty.won')),
            'penalties_committed' => $this->toInt(data_get($statistics, 'penalty.commited')),
            'penalties_scored' => $this->toInt(data_get($statistics, 'penalty.scored')),
            'penalties_missed' => $this->toInt(data_get($statistics, 'penalty.missed')),
            'penalties_saved' => $this->toInt(data_get($statistics, 'penalty.saved')),
        ];
    }

    private function toInt(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    private function toFloat(mixed $value): float
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function toNullableFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private function toNullableInt(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private function toNullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
