<?php

use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\FixtureEventsService;

test('it removes stale fixture events when a corrected non-empty event snapshot is stored', function () {
    [$fixture, $homeTeam] = createFixtureForFixtureEventsService();
    $player = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 4, null, null, null),
    ], $fixture->id);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 6, 1000, 'I. Saibari', null),
    ], $fixture->id);

    expect(FixtureEvent::query()->count())->toBe(1);

    $event = FixtureEvent::query()->firstOrFail();

    expect($event->fixture_id)->toBe($fixture->id)
        ->and($event->team_id)->toBe($homeTeam->id)
        ->and($event->player_id)->toBe($player->id)
        ->and($event->player_name)->toBe('I. Saibari')
        ->and($event->time_elapsed)->toBe(6)
        ->and($event->detail)->toBe('Normal Goal')
        ->and($event->event_key)->toBe(FixtureEvent::buildEventKey(
            $fixture->id,
            6,
            null,
            $homeTeam->id,
            'Goal',
            'Normal Goal',
        ));
});

test('it does not wipe existing fixture events when the api response is empty', function () {
    [$fixture, $homeTeam] = createFixtureForFixtureEventsService();
    $player = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 25, 1000, 'I. Saibari', 'Clinical finish'),
    ], $fixture->id);

    app(FixtureEventsService::class)->storeFixtureEvents([], $fixture->id);

    $event = FixtureEvent::query()->firstOrFail();

    expect(FixtureEvent::query()->count())->toBe(1)
        ->and($event->player_id)->toBe($player->id)
        ->and($event->player_name)->toBe('I. Saibari')
        ->and($event->comments)->toBe('Clinical finish');
});

test('it updates duplicate fixture events on repeated syncs without crashing', function () {
    [$fixture, $homeTeam] = createFixtureForFixtureEventsService();
    $player = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 12, 1000, 'I. Saibari', 'Initial comment'),
    ], $fixture->id);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 12, 1000, 'I. Saibari', 'Updated comment'),
    ], $fixture->id);

    expect(FixtureEvent::query()->count())->toBe(1);

    $event = FixtureEvent::query()->firstOrFail();

    expect($event->player_id)->toBe($player->id)
        ->and($event->comments)->toBe('Updated comment')
        ->and($event->event_key)->toBe(FixtureEvent::buildEventKey(
            $fixture->id,
            12,
            null,
            $homeTeam->id,
            'Goal',
            'Normal Goal',
        ));
});

test('it inserts valid current fixture events and skips invalid payloads', function () {
    [$fixture, $homeTeam, $awayTeam] = createFixtureForFixtureEventsService();
    $scorer = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);
    $assist = Player::query()->create([
        'external_id' => 1001,
        'display_name' => 'A. Ounahi',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload(
            $homeTeam->external_id,
            25,
            1000,
            'I. Saibari',
            'Clinical finish',
            1001,
            'A. Ounahi',
        ),
        createApiFixtureEventPayload(
            $awayTeam->external_id,
            32,
            null,
            'Away player',
            null,
            null,
            null,
            'Card',
            'Yellow Card',
        ),
        createInvalidApiFixtureEventPayload($homeTeam->external_id),
    ], $fixture->id);

    expect(FixtureEvent::query()->count())->toBe(2);

    $goal = FixtureEvent::query()
        ->where('type', 'Goal')
        ->firstOrFail();
    $card = FixtureEvent::query()
        ->where('type', 'Card')
        ->firstOrFail();

    expect($goal->fixture_id)->toBe($fixture->id)
        ->and($goal->team_id)->toBe($homeTeam->id)
        ->and($goal->team_name)->toBe('Morocco')
        ->and($goal->player_id)->toBe($scorer->id)
        ->and($goal->player_name)->toBe('I. Saibari')
        ->and($goal->assist_id)->toBe($assist->id)
        ->and($goal->assist_name)->toBe('A. Ounahi')
        ->and($goal->comments)->toBe('Clinical finish')
        ->and($goal->event_key)->toBe(FixtureEvent::buildEventKey(
            $fixture->id,
            25,
            null,
            $homeTeam->id,
            'Goal',
            'Normal Goal',
        ))
        ->and($card->fixture_id)->toBe($fixture->id)
        ->and($card->team_id)->toBe($awayTeam->id)
        ->and($card->type)->toBe('Card')
        ->and($card->detail)->toBe('Yellow Card')
        ->and($card->player_id)->toBeNull();
});

function createFixtureForFixtureEventsService(): array
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 31,
        'name' => 'Morocco',
        'code' => 'MAR',
        'logo_url' => 'https://example.com/morocco.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 73,
        'name' => 'Tunisia',
        'code' => 'TUN',
        'logo_url' => 'https://example.com/tunisia.png',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'First Half',
    ]);

    return [$fixture, $homeTeam, $awayTeam];
}

function createApiFixtureEventPayload(
    int $teamExternalId,
    int $minute,
    ?int $playerExternalId,
    ?string $playerName,
    ?string $comments,
    ?int $assistExternalId = null,
    ?string $assistName = null,
    string $type = 'Goal',
    string $detail = 'Normal Goal',
): array {
    return [
        'time' => [
            'elapsed' => $minute,
            'extra' => null,
        ],
        'team' => [
            'id' => $teamExternalId,
            'name' => $teamExternalId === 31 ? 'Morocco' : 'Tunisia',
        ],
        'player' => [
            'id' => $playerExternalId,
            'name' => $playerName,
        ],
        'assist' => [
            'id' => $assistExternalId,
            'name' => $assistName,
        ],
        'type' => $type,
        'detail' => $detail,
        'comments' => $comments,
    ];
}

function createInvalidApiFixtureEventPayload(int $teamExternalId): array
{
    return [
        'time' => [
            'elapsed' => null,
            'extra' => null,
        ],
        'team' => [
            'id' => $teamExternalId,
            'name' => 'Morocco',
        ],
        'player' => [
            'id' => null,
            'name' => null,
        ],
        'assist' => [
            'id' => null,
            'name' => null,
        ],
        'type' => 'Goal',
        'detail' => 'Normal Goal',
        'comments' => null,
    ];
}
