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
        $playerIds = Player::query()
            ->whereIn('external_id', $this->extractEventPlayerIds($events))
            ->pluck('id', 'external_id');

        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($events, 'team.id'))
            ->pluck('id', 'external_id');

        foreach ($events as $event) {
            $eventPayload = $this->eventPayload($event, $playerIds, $teamIds);

            if ($eventPayload === null) {
                continue;
            }

            $fixtureEvent = FixtureEvent::query()->firstOrNew(
                $this->eventIdentity($fixtureId, $eventPayload),
            );

            $fixtureEvent->fill($this->eventAttributes($eventPayload, $fixtureEvent));
            $fixtureEvent->save();
        }
    }

    /**
     * @return array{
     *     team_id: int,
     *     team_name: string|null,
     *     time_elapsed: int,
     *     extra_time: int|null,
     *     type: string,
     *     detail: string,
     *     player_id: int|null,
     *     player_name: string|null,
     *     assist_id: int|null,
     *     assist_name: string|null,
     *     comments: string|null
     * }|null
     */
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

    /**
     * @return \Illuminate\Support\Collection<int, int>
     */
    private function extractEventPlayerIds(array $events): Collection
    {
        return $this->extractNumericIds($events, 'player.id')
            ->merge($this->extractNumericIds($events, 'assist.id'))
            ->unique()
            ->values();
    }

    /**
     * @param  array{
     *     team_id: int,
     *     time_elapsed: int,
     *     extra_time: int|null,
     *     type: string,
     *     detail: string
     * }  $eventPayload
     * @return array{fixture_id: int, event_key: string}
     */
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

    /**
     * @param  array{
     *     team_id: int,
     *     team_name: string|null,
     *     time_elapsed: int,
     *     extra_time: int|null,
     *     type: string,
     *     detail: string,
     *     player_id: int|null,
     *     player_name: string|null,
     *     assist_id: int|null,
     *     assist_name: string|null,
     *     comments: string|null
     * }  $eventPayload
     * @return array<string, int|string|null>
     */
    private function eventAttributes(array $eventPayload, FixtureEvent $fixtureEvent): array
    {
        return [
            'team_id' => $eventPayload['team_id'],
            'team_name' => $this->preferIncomingString(
                $eventPayload['team_name'],
                $fixtureEvent->team_name,
            ),
            'time_elapsed' => $eventPayload['time_elapsed'],
            'extra_time' => $eventPayload['extra_time'],
            'type' => $eventPayload['type'],
            'detail' => $eventPayload['detail'],
            'player_id' => $eventPayload['player_id'] ?? $fixtureEvent->player_id,
            'player_name' => $this->preferIncomingString(
                $eventPayload['player_name'],
                $fixtureEvent->player_name,
            ),
            'assist_id' => $eventPayload['assist_id'] ?? $fixtureEvent->assist_id,
            'assist_name' => $this->preferIncomingString(
                $eventPayload['assist_name'],
                $fixtureEvent->assist_name,
            ),
            'comments' => $this->preferIncomingString(
                $eventPayload['comments'],
                $fixtureEvent->comments,
            ),
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

    private function preferIncomingString(?string $incoming, ?string $existing): ?string
    {
        return $incoming ?? $existing;
    }
}
