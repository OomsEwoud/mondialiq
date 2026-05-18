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
            $playerId = Player::query()->where('external_id', $event['player']['id'])->value('id');
            $assistId = $event['assist']['id']
                ? Player::query()->where('external_id', $event['assist']['id'])->value('id')
                : null;
            $teamId = Team::query()->where('external_id', $event['team']['id'])->value('id');

            FixtureEvent::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id' => $teamId,
                    'time_elapsed' => $event['time']['elapsed'],
                    'extra_time' => $event['time']['extra'],
                    'type' => $event['type'],
                    'player_id' => $playerId,
                ],
                [
                    'assist_id' => $assistId,
                    'detail' => $event['detail'],
                ],
            );
        }
    }
}
