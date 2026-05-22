<?php

namespace App\Services\Fixture;

use App\Models\FixtureEvent;
use App\Models\Player;
use App\Models\Team;

class FixtureEventsService
{
    public function storeFixtureEvents(array $events, int $fixtureId): void
    {
        foreach ($events as $event) {
            $timeElapsed = data_get($event, 'time.elapsed');
            $type = data_get($event, 'type');
            $detail = data_get($event, 'detail');
            $playerId = Player::query()->where('external_id', data_get($event, 'player.id'))->value('id');
            $assistId = data_get($event, 'assist.id')
                ? Player::query()->where('external_id', data_get($event, 'assist.id'))->value('id')
                : null;
            $teamId = Team::query()->where('external_id', data_get($event, 'team.id'))->value('id');

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
}
