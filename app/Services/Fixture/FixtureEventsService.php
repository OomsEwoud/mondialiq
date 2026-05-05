<?php

namespace App\Services\Fixture;

use App\Models\Team;
use App\Models\Player;
use App\Models\FixtureEvent;


class FixtureEventsService
{
    public function storeFixtureEvents(array $events, int $fixtureId): void
    {
        foreach ($events as $event) {
            $playerId = Player::where('external_id', $event['player']['id'])->value('id');
            $assistId = $event['assist']['id'] ? Player::where('external_id', $event['assist']['id'])->value('id') : null;
            $teamId = Team::where('external_id', $event['team']['id'])->value('id');

            FixtureEvent::updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id'    => $teamId,
                    'time_elapsed'    => $event['time']['elapsed'],
                    'extra_time'      => $event['time']['extra'],
                    'type'       => $event['type'],
                    'player_id'  => $playerId ?? null,
                ],
                [
                    'assist_id' => $assistId,
                    'detail'    => $event['detail'],
                ]
            );
        }
    }
}
