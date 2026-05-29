<?php

namespace App\Services\Fixture;

use App\Models\FixtureEvent;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Support\Collection;

class FixtureEventsService
{
    public function storeFixtureEvents(array $events, int $fixtureId): void
    {
        $playerExternalIds = $this->extractIds($events, 'player.id')
            ->merge($this->extractIds($events, 'assist.id'));

        $playerIds = Player::query()
            ->whereIn('external_id', $playerExternalIds)
            ->pluck('id', 'external_id');

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractIds($events, 'team.id'))
            ->pluck('id', 'external_id');

        foreach ($events as $event) {
            $timeElapsed = data_get($event, 'time.elapsed');
            $type = data_get($event, 'type');
            $detail = data_get($event, 'detail');
            $playerId = $playerIds[data_get($event, 'player.id')] ?? null;
            $assistId = $playerIds[data_get($event, 'assist.id')] ?? null;
            $teamId = $teamIds[data_get($event, 'team.id')] ?? null;

            if (! $teamId || ! is_numeric($timeElapsed) || ! is_string($type) || ! is_string($detail)) {
                continue;
            }

            FixtureEvent::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id' => $teamId,
                    'time_elapsed' => (int) $timeElapsed,
                    'extra_time' => data_get($event, 'time.extra'),
                    'type' => $type,
                    'player_id' => $playerId,
                ],
                [
                    'assist_id' => $assistId,
                    'detail' => $detail,
                ],
            );
        }
    }

    private function extractIds(array $items, string $path): Collection
    {
        return collect($items)
            ->pluck($path)
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }
}
