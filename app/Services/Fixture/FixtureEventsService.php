<?php

namespace App\Services\Fixture;

use App\Models\FixtureEvent;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;

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
                $this->eventIdentity($fixtureId, $event, $teamId, (int) $timeElapsed, $type, $playerId),
                $this->eventAttributes($assistId, $detail),
            );
        }
    }

    /**
     * @return array{fixture_id: int, team_id: int, time_elapsed: int, extra_time: mixed, type: string, player_id: int|null}
     */
    private function eventIdentity(
        int $fixtureId,
        array $event,
        int $teamId,
        int $timeElapsed,
        string $type,
        ?int $playerId,
    ): array {
        return [
            'fixture_id' => $fixtureId,
            'team_id' => $teamId,
            'time_elapsed' => $timeElapsed,
            'extra_time' => data_get($event, 'time.extra'),
            'type' => $type,
            'player_id' => $playerId,
        ];
    }

    /**
     * @return array{assist_id: int|null, detail: string}
     */
    private function eventAttributes(?int $assistId, string $detail): array
    {
        return [
            'assist_id' => $assistId,
            'detail' => $detail,
        ];
    }
}
