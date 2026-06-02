<?php

use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\FixtureEventsService;

test('it updates an existing fixture event when better player data arrives', function () {
    [$fixture, $homeTeam] = createFixtureForFixtureEventsService();
    $player = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 4, null, null, null),
    ], $fixture->id);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 4, 1000, 'I. Saibari', null),
    ], $fixture->id);

    expect(FixtureEvent::query()->count())->toBe(1);

    $event = FixtureEvent::query()->firstOrFail();

    expect($event->fixture_id)->toBe($fixture->id)
        ->and($event->team_id)->toBe($homeTeam->id)
        ->and($event->player_id)->toBe($player->id)
        ->and($event->player_name)->toBe('I. Saibari')
        ->and($event->detail)->toBe('Normal Goal')
        ->and($event->event_key)->toBe(FixtureEvent::buildEventKey(
            $fixture->id,
            4,
            null,
            $homeTeam->id,
            'Goal',
            'Normal Goal',
        ));
});

test('it does not overwrite better player data with null api player data', function () {
    [$fixture, $homeTeam] = createFixtureForFixtureEventsService();
    $player = Player::query()->create([
        'external_id' => 1000,
        'display_name' => 'I. Saibari',
    ]);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 25, 1000, 'I. Saibari', 'Clinical finish'),
    ], $fixture->id);

    app(FixtureEventsService::class)->storeFixtureEvents([
        createApiFixtureEventPayload($homeTeam->external_id, 25, null, null, null),
    ], $fixture->id);

    $event = FixtureEvent::query()->firstOrFail();

    expect(FixtureEvent::query()->count())->toBe(1)
        ->and($event->player_id)->toBe($player->id)
        ->and($event->player_name)->toBe('I. Saibari')
        ->and($event->comments)->toBe('Clinical finish');
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
            'id' => null,
            'name' => null,
        ],
        'type' => 'Goal',
        'detail' => 'Normal Goal',
        'comments' => $comments,
    ];
}
