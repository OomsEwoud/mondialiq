<?php

namespace App\Services\Fixture;

use App\Models\Player;
use App\Models\PlayerFixtureStat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class FixturePlayerStatsService
{
    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    public function storeFixturePlayerStats(array $teamPlayerStats, int $fixtureId): array
    {
        if ($teamPlayerStats === []) {
            return $this->emptySummary();
        }

        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractPlayerIds($teamPlayerStats))
            ->pluck('id', 'external_id');

        $summary = $this->emptySummary();

        foreach ($teamPlayerStats as $teamData) {
            foreach ($this->playersFromTeamStats($teamData) as $playerData) {
                $summary['processed']++;
                $localPlayerId = $this->localPlayerId($playerData, $playerIds);

                if ($localPlayerId === null) {
                    $summary['skipped']++;

                    continue;
                }

                $attributes = $this->mapStats($playerData, $fixtureId, $localPlayerId);

                $playerFixtureStat = PlayerFixtureStat::query()->updateOrCreate(
                    $this->playerFixtureStatIdentity($fixtureId, $localPlayerId),
                    $attributes,
                );

                $summary = $this->recordStoredModel($summary, $playerFixtureStat);
            }
        }

        return $summary;
    }

    private function playersFromTeamStats(array $teamData): array
    {
        $players = data_get($teamData, 'players', []);

        return is_array($players) ? $players : [];
    }

    private function localPlayerId(array $playerData, Collection $playerIds): ?int
    {
        $externalPlayerId = data_get($playerData, 'player.id');

        if (! is_numeric($externalPlayerId)) {
            return null;
        }

        $localPlayerId = $playerIds[(int) $externalPlayerId] ?? null;

        return is_numeric($localPlayerId) ? (int) $localPlayerId : null;
    }

    /**
     * @return array{fixture_id: int, player_id: int}
     */
    private function playerFixtureStatIdentity(int $fixtureId, int $playerId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'player_id' => $playerId,
        ];
    }

    /**
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    private function emptySummary(): array
    {
        return [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];
    }

    /**
     * @param  array{processed: int, created: int, updated: int, skipped: int}  $summary
     * @return array{processed: int, created: int, updated: int, skipped: int}
     */
    private function recordStoredModel(array $summary, Model $model): array
    {
        if ($model->wasRecentlyCreated) {
            $summary['created']++;

            return $summary;
        }

        if ($model->wasChanged()) {
            $summary['updated']++;
        }

        return $summary;
    }

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function extractPlayerIds(array $teamPlayerStats): Collection
    {
        return collect($teamPlayerStats)
            ->pluck('players')
            ->flatten(1)
            ->pluck('player.id')
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }

    /**
     * @return array<string, bool|float|int|string|null>
     */
    private function mapStats(array $playerData, int $fixtureId, int $playerId): array
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

    /**
     * @return array{game_minutes: int, number: int|null, position: string|null, rating: float|null, is_captain: bool, is_substitute: bool, offsides: int}
     */
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

    /**
     * @return array{total_shots: int, shots_on_target: int}
     */
    private function shotAttributes(array $statistics): array
    {
        return [
            'total_shots' => $this->toInt(data_get($statistics, 'shots.total')),
            'shots_on_target' => $this->toInt(data_get($statistics, 'shots.on')),
        ];
    }

    /**
     * @return array{goals: int, goals_conceded: int, assists: int, saves: int}
     */
    private function goalAttributes(array $statistics): array
    {
        return [
            'goals' => $this->toInt(data_get($statistics, 'goals.total')),
            'goals_conceded' => $this->toInt(data_get($statistics, 'goals.conceded')),
            'assists' => $this->toInt(data_get($statistics, 'goals.assists')),
            'saves' => $this->toInt(data_get($statistics, 'goals.saves')),
        ];
    }

    /**
     * @return array{passes: int, key_passes: int, passes_accuracy: float}
     */
    private function passingAttributes(array $statistics): array
    {
        return [
            'passes' => $this->toInt(data_get($statistics, 'passes.total')),
            'key_passes' => $this->toInt(data_get($statistics, 'passes.key')),
            'passes_accuracy' => $this->toFloat(data_get($statistics, 'passes.accuracy')),
        ];
    }

    /**
     * @return array{tackles: int, blocks: int, interceptions: int}
     */
    private function defensiveAttributes(array $statistics): array
    {
        return [
            'tackles' => $this->toInt(data_get($statistics, 'tackles.total')),
            'blocks' => $this->toInt(data_get($statistics, 'tackles.blocks')),
            'interceptions' => $this->toInt(data_get($statistics, 'tackles.interceptions')),
        ];
    }

    /**
     * @return array{duels: int, duels_won: int, dribbles_attempts: int, dribbles_success: int, dribbles_past: int}
     */
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

    /**
     * @return array{fouls_drawn: int, fouls_committed: int, yellow_cards: int, red_cards: int}
     */
    private function disciplineAttributes(array $statistics): array
    {
        return [
            'fouls_drawn' => $this->toInt(data_get($statistics, 'fouls.drawn')),
            'fouls_committed' => $this->toInt(data_get($statistics, 'fouls.committed')),
            'yellow_cards' => $this->toInt(data_get($statistics, 'cards.yellow')),
            'red_cards' => $this->toInt(data_get($statistics, 'cards.red')),
        ];
    }

    /**
     * @return array{penalties_won: int, penalties_committed: int, penalties_scored: int, penalties_missed: int, penalties_saved: int}
     */
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
