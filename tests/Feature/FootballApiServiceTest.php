<?php

use App\Services\Apis\FootballApiService;
use Illuminate\Support\Facades\Http;
use RuntimeException;

beforeEach(function () {
    config([
        'services.api_football.base_url' => 'https://api-football.test',
        'services.api_football.api_key' => 'test-key',
    ]);
});

test('football api service returns response items from endpoints', function () {
    Http::fake([
        '*' => Http::response([
            'response' => [
                ['name' => 'Belgium'],
            ],
        ]),
    ]);

    $countries = app(FootballApiService::class)->getCountries();

    expect($countries)->toBe([
        ['name' => 'Belgium'],
    ]);

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api-football.test/countries');
});

test('football api service fetches every page for paginated endpoints', function () {
    Http::fakeSequence()
        ->push([
            'response' => [
                ['player' => ['id' => 1]],
            ],
            'paging' => ['total' => 2],
        ])
        ->push([
            'response' => [
                ['player' => ['id' => 2]],
            ],
            'paging' => ['total' => 2],
        ]);

    $players = app(FootballApiService::class)->getPlayersByLeagueSeason(39, 2026);

    expect($players)->toBe([
        ['player' => ['id' => 1]],
        ['player' => ['id' => 2]],
    ]);

    Http::assertSentCount(2);
    Http::assertSent(
        fn ($request): bool => $request->url() === 'https://api-football.test/players?league=39&season=2026&page=1',
    );
    Http::assertSent(
        fn ($request): bool => $request->url() === 'https://api-football.test/players?league=39&season=2026&page=2',
    );
});

test('football api service returns an empty array for invalid json responses', function () {
    Http::fake([
        '*' => Http::response('invalid-json'),
    ]);

    expect(app(FootballApiService::class)->getCountries())->toBe([]);
});

test('football api service throws a clear exception for failed responses', function () {
    Http::fake([
        '*' => Http::response(['message' => 'Rate limit exceeded'], 429),
    ]);

    expect(fn () => app(FootballApiService::class)->getCountries())
        ->toThrow(RuntimeException::class, 'API call to /countries failed with status 429');
});
