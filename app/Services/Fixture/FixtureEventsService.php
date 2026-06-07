<?php

namespace App\Services\Fixture;

use App\Models\FixtureEvent;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FixtureEventsService
{
    use ExtractsApiPayloadIds;

    public function storeFixtureEvents(array $events, int $fixtureId): void
    {
        if ($events === []) {
            return;
        }

        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractEventPlayerIds($events))
            ->pluck('id', 'external_id');

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($events, 'team.id'))
            ->pluck('id', 'external_id');

        $eventRecords = [];

        foreach ($events as $event) {
            $eventPayload = $this->eventPayload($event, $playerIds, $teamIds);

            if ($eventPayload === null) {
                continue;
            }

            $eventIdentity = $this->eventIdentity($fixtureId, $eventPayload);

            $eventRecords[$eventIdentity['event_key']] = [
                ...$eventIdentity,
                ...$this->eventAttributes($eventPayload),
            ];
        }

        if ($eventRecords === []) {
            return;
        }

        FixtureEvent::query()->upsert(
            array_values($eventRecords),
            ['fixture_id', 'event_key'],
            [
                'team_id',
                'team_name',
                'time_elapsed',
                'extra_time',
                'type',
                'detail',
                'player_id',
                'player_name',
                'assist_id',
                'assist_name',
                'comments',
                'updated_at',
            ],
        );

        FixtureEvent::query()
            ->where('fixture_id', $fixtureId)
            ->whereNotIn('event_key', array_keys($eventRecords))
            ->delete();
    }

    private function eventPayload(array $event, Collection $playerIds, Collection $teamIds): ?array
    {
        $timeElapsed = data_get($event, 'time.elapsed');
        $timeExtra = data_get($event, 'time.extra');
        $type = data_get($event, 'type');
        $detail = data_get($event, 'detail');
        $externalTeamId = data_get($event, 'team.id');
        $teamId = $teamIds[$externalTeamId] ?? null;

        if (! is_numeric($teamId) || ! is_numeric($timeElapsed) || ! is_string($type) || ! is_string($detail)) {
            return null;
        }

        $normalizedTimeElapsed = (int) $timeElapsed;
        $normalizedTimeExtra = is_numeric($timeExtra) ? (int) $timeExtra : null;
        $normalizedTeamId = (int) $teamId;

        return [
            'team_id' => $normalizedTeamId,
            'team_name' => $this->nullableString(data_get($event, 'team.name')),
            'time_elapsed' => $normalizedTimeElapsed,
            'extra_time' => $normalizedTimeExtra,
            'type' => trim($type),
            'detail' => trim($detail),
            'player_id' => $this->localPlayerId($event, 'player.id', $playerIds),
            'player_name' => $this->nullableString(data_get($event, 'player.name')),
            'assist_id' => $this->localPlayerId($event, 'assist.id', $playerIds),
            'assist_name' => $this->nullableString(data_get($event, 'assist.name')),
            'comments' => $this->nullableString(data_get($event, 'comments')),
        ];
    }

    private function localPlayerId(array $event, string $path, Collection $playerIds): ?int
    {
        return $this->localIdForExternalId($playerIds, data_get($event, $path));
    }

    private function extractEventPlayerIds(array $events): Collection
    {
        return $this->extractNumericIds($events, 'player.id')
            ->merge($this->extractNumericIds($events, 'assist.id'))
            ->unique()
            ->values();
    }

    private function eventIdentity(
        int $fixtureId,
        array $eventPayload,
    ): array {
        return [
            'fixture_id' => $fixtureId,
            'event_key' => FixtureEvent::buildEventKey(
                $fixtureId,
                $eventPayload['time_elapsed'],
                $eventPayload['extra_time'],
                $eventPayload['team_id'],
                $eventPayload['type'],
                $eventPayload['detail'],
            ),
        ];
    }

    private function eventAttributes(array $eventPayload): array
    {
        return [
            'team_id' => $eventPayload['team_id'],
            'team_name' => $eventPayload['team_name'],
            'time_elapsed' => $eventPayload['time_elapsed'],
            'extra_time' => $eventPayload['extra_time'],
            'type' => $eventPayload['type'],
            'detail' => $eventPayload['detail'],
            'player_id' => $eventPayload['player_id'],
            'player_name' => $eventPayload['player_name'],
            'assist_id' => $eventPayload['assist_id'],
            'assist_name' => $eventPayload['assist_name'],
            'comments' => $eventPayload['comments'],
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $normalized = Str::of($value)->trim()->value();

        return $normalized !== '' ? $normalized : null;
    }
}
