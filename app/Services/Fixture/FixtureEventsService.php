<?php

namespace App\Services\Fixture;

use App\Models\FixtureEvent;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Support\Collection;

class FixtureEventsService
{
    use ExtractsApiPayloadIds;

    public function storeFixtureEvents(array $events, int $fixtureId): void
    {
        $playerExternalIds = $this->extractNumericIds($events, 'player.id')
            ->merge($this->extractNumericIds($events, 'assist.id'))
            ->unique()
            ->values();

        $playerIds = Player::query()
            ->whereIn('external_id', $playerExternalIds)
            ->pluck('id', 'external_id');

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($events, 'team.id'))
            ->pluck('id', 'external_id');

        foreach ($events as $event) {
            $eventPayload = $this->eventPayload($event, $playerIds, $teamIds);

            if ($eventPayload === null) {
                continue;
            }

            FixtureEvent::query()->updateOrCreate(
                $this->eventIdentity($fixtureId, $event, $eventPayload),
                $this->eventAttributes($eventPayload),
            );
        }
    }

    /**
     * @return array{team_id: int, time_elapsed: int, type: string, detail: string, player_id: int|null, assist_id: int|null}|null
     */
    private function eventPayload(array $event, Collection $playerIds, Collection $teamIds): ?array
    {
        $timeElapsed = data_get($event, 'time.elapsed');
        $type = data_get($event, 'type');
        $detail = data_get($event, 'detail');
        $teamId = $teamIds[data_get($event, 'team.id')] ?? null;

        if (! is_numeric($teamId) || ! is_numeric($timeElapsed) || ! is_string($type) || ! is_string($detail)) {
            return null;
        }

        return [
            'team_id' => (int) $teamId,
            'time_elapsed' => (int) $timeElapsed,
            'type' => $type,
            'detail' => $detail,
            'player_id' => $this->localPlayerId($event, 'player.id', $playerIds),
            'assist_id' => $this->localPlayerId($event, 'assist.id', $playerIds),
        ];
    }

    private function localPlayerId(array $event, string $path, Collection $playerIds): ?int
    {
        $playerId = $playerIds[data_get($event, $path)] ?? null;

        return is_numeric($playerId) ? (int) $playerId : null;
    }

    /**
     * @param  array{team_id: int, time_elapsed: int, type: string, detail: string, player_id: int|null, assist_id: int|null}  $eventPayload
     * @return array{fixture_id: int, team_id: int, time_elapsed: int, extra_time: mixed, type: string, player_id: int|null}
     */
    private function eventIdentity(
        int $fixtureId,
        array $event,
        array $eventPayload,
    ): array {
        return [
            'fixture_id' => $fixtureId,
            'team_id' => $eventPayload['team_id'],
            'time_elapsed' => $eventPayload['time_elapsed'],
            'extra_time' => data_get($event, 'time.extra'),
            'type' => $eventPayload['type'],
            'player_id' => $eventPayload['player_id'],
        ];
    }

    /**
     * @param  array{team_id: int, time_elapsed: int, type: string, detail: string, player_id: int|null, assist_id: int|null}  $eventPayload
     * @return array{assist_id: int|null, detail: string}
     */
    private function eventAttributes(array $eventPayload): array
    {
        return [
            'assist_id' => $eventPayload['assist_id'],
            'detail' => $eventPayload['detail'],
        ];
    }
}
