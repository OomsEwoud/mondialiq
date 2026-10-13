<?php

use App\Jobs\SyncFootballBatch;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Team;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use App\Services\Football\FixtureSyncService;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Sleep;

beforeEach(function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));
    config([
        'services.api_football.base_url' => 'https://api-football.test',
        'services.api_football.api_key' => 'test-key',
        'services.api_football.league_id' => 1,
        'services.api_football.season' => 2026,
    ]);
    Http::preventStrayRequests();
    Sleep::fake();
});

afterEach(fn () => Carbon::setTestNow());

test('live fixtures use one bundled request and retain scores and statistics', function () {
    $first = syncTestFixture(100);
    $second = syncTestFixture(101);
    Http::fake(['*' => Http::response(['response' => [syncTestPayload($first), syncTestPayload($second)]])]);

    $this->artisan('football:sync live')->assertSuccessful();
    $this->artisan('football:sync live')->assertSuccessful();

    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => $request['ids'] === '100-101');
    expect($first->refresh()->fulltime_home_goals)->toBe(1)
        ->and($first->fixtureStats()->count())->toBe(2);
});

test('fixture requests split at twenty ids', function () {
    $fixtures = collect(range(100, 120))->map(fn (int $id) => syncTestFixture($id));
    Http::fake(fn ($request) => Http::response(['response' => $fixtures
        ->whereIn('external_id', explode('-', $request['ids']))->map(fn (Fixture $fixture) => syncTestPayload($fixture))->values()->all()]));

    $this->artisan('football:sync live')->assertSuccessful();
    Http::assertSentCount(2);
});

test('missing embedded datasets fall back once while embedded empty datasets do not', function () {
    $fixture = syncTestFixture(100);
    $payload = syncTestPayload($fixture);
    unset($payload['statistics']);
    Http::fake([
        '*/fixtures?*' => Http::response(['response' => [$payload]]),
        '*/fixtures/statistics*' => Http::response(['response' => []]),
    ]);

    $this->artisan('football:sync live')->assertSuccessful();
    Http::assertSentCount(2);
});

test('fixture locks are shared with legacy commands and prevent concurrent calls', function () {
    $fixture = syncTestFixture(100);
    $lock = Cache::lock('football:fixture:'.$fixture->id, 3600);
    $lock->get();
    Http::fake();

    try {
        $this->artisan('football:sync live')->assertSuccessful();
        $this->artisan('app:add-fixture-data')->assertSuccessful();
        Http::assertNothingSent();
    } finally {
        $lock->release();
    }
});

test('final fixtures are immutable and excluded from subsequent syncs', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $payload = syncTestPayload($fixture);
    $payload['fixture']['status'] = ['short' => 'FT', 'long' => 'Match Finished', 'elapsed' => 90];
    $payload['lineups'] = syncTestLineups($fixture);
    $payload['players'] = array_map(fn (array $lineup) => [
        'team' => $lineup['team'],
        'players' => array_map(fn (array $entry) => ['player' => $entry['player'], 'statistics' => [['games' => ['minutes' => 90]]]], $lineup['startXI']),
    ], $payload['lineups']);
    Http::fake(['*' => Http::response(['response' => [$payload]])]);

    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->final_data_synced_at)->not->toBeNull()
        ->and($fixture->player_stats_synced_at)->not->toBeNull()
        ->and($fixture->has_lineups)->toBeTrue();

    $this->travel(20)->minutes();
    $this->artisan('football:sync post-match')->assertSuccessful();
    $payload['goals']['home'] = 9;
    app(FixtureService::class)->storeFixtures([$payload]);

    Http::assertSentCount(1);
    expect($fixture->refresh()->fulltime_home_goals)->toBe(1);
});

test('empty final statistics remain incomplete and retries stop after three attempts', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $payload = syncTestPayload($fixture);
    $payload['fixture']['status'] = ['short' => 'FT', 'long' => 'Match Finished'];
    $payload['statistics'] = [];
    Http::fake(['*' => Http::response(['response' => [$payload]])]);

    for ($attempt = 0; $attempt < 4; $attempt++) {
        $this->artisan('football:sync post-match')->assertSuccessful();
        $this->travel(16)->minutes();
    }

    Http::assertSentCount(3);
    expect($fixture->refresh()->final_data_synced_at)->toBeNull()
        ->and($fixture->final_data_sync_attempts)->toBe(3)
        ->and($fixture->player_stats_sync_attempts)->toBe(3)
        ->and($fixture->player_stats_synced_at)->toBeNull();
});

test('http failures consume final attempts and respect persistent backoff', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    Http::fake(['*' => Http::response([], 503)]);

    for ($attempt = 0; $attempt < 3; $attempt++) {
        $this->artisan('football:sync post-match')->assertFailed();
        $this->artisan('football:sync post-match')->assertSuccessful();
        $this->travel(16)->minutes();
    }
    $this->artisan('football:sync post-match')->assertSuccessful();

    Http::assertSentCount(6);
    expect($fixture->refresh()->final_data_sync_attempts)->toBe(3);
});

test('lineups respect window backoff completeness and maximum attempts', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'NS', 'status_long' => 'Not Started', 'match_date' => now('Europe/Brussels')->addMinutes(45)]);
    syncTestFixture(101, ['status_short' => 'NS', 'match_date' => now('Europe/Brussels')->addDays(2)]);
    Http::fake(['*' => Http::response(['response' => []])]);

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->artisan('football:sync pre-match')->assertSuccessful();
        $this->artisan('app:add-fixture-lineups')->assertSuccessful();
        $this->travel(15)->minutes();
    }

    Http::assertSentCount(4);
    expect($fixture->refresh()->lineup_sync_attempts)->toBe(4)->and($fixture->has_lineups)->toBeFalse();
});

test('partial lineups are saved without declaring both teams complete', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'NS', 'status_long' => 'Not Started', 'match_date' => now('Europe/Brussels')->addMinutes(30)]);
    Http::fake(['*' => Http::response(['response' => [syncTestLineups($fixture)[0]]])]);

    $this->artisan('football:sync pre-match')->assertSuccessful();
    expect($fixture->refresh()->has_lineups)->toBeFalse()->and($fixture->fixturePlayers()->count())->toBe(11);
});

test('inactive seasons and stale live fixtures are excluded', function () {
    syncTestFixture(100, ['season' => 2022]);
    syncTestFixture(101, ['match_date' => now('Europe/Brussels')->subDays(2)]);
    Http::fake();
    $this->artisan('football:sync live')->assertSuccessful();
    Http::assertNothingSent();
});

test('http cache deduplicates across service instances and logs only real calls with quota', function () {
    Log::spy();
    Http::fake(['*' => Http::response(['response' => [['name' => 'Belgium']]], 200, ['x-ratelimit-requests-remaining' => '123'])]);

    app(FootballApiService::class)->getCountries();
    app(FootballApiService::class)->getCountries();

    Http::assertSentCount(1);
    Log::shouldHaveReceived('info')->once()->with('football_api.request', Mockery::on(fn ($context) => $context['endpoint'] === '/countries' && $context['daily_remaining'] === '123'
        && $context['calls'] === 1 && $context['status'] === 200 && isset($context['caller'], $context['timestamp'])
        && ! isset($context['api_key'], $context['response'])
    ));
});

test('rate limits stop immediately without retry amplification', function () {
    Http::fake(['*' => Http::response(['errors' => ['rateLimit' => 'Exceeded']], 429)]);
    expect(fn () => app(FootballApiService::class)->getCountries())->toThrow(RuntimeException::class);
    expect(fn () => app(FootballApiService::class)->getLeagues())->toThrow(RuntimeException::class);
    Http::assertSentCount(1);
});

test('http 200 api errors are failures and are not cached', function () {
    Http::fakeSequence()->push(['errors' => ['plan' => 'Denied'], 'response' => []])->push(['response' => []]);
    expect(fn () => app(FootballApiService::class)->getCountries())->toThrow(RuntimeException::class);
    expect(app(FootballApiService::class)->getCountries())->toBe([]);
    Http::assertSentCount(2);
});

test('queue mode dispatches bounded unique fixture jobs with no inline API calls', function () {
    Bus::fake();
    $fixture = syncTestFixture(100);
    Http::fake();
    $this->artisan('football:sync live --queue')->assertSuccessful();
    Bus::assertDispatched(SyncFootballBatch::class, fn ($job) => $job->fixtureIds === [$fixture->id] && $job->connection === 'football' && $job->timeout < config('queue.connections.football.retry_after'));
    Http::assertNothingSent();
});

test('quota pauses defer fixtures without exhausting dataset retries', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    Http::fakeSequence()->push(['response' => []], 200, ['x-ratelimit-requests-remaining' => '0']);
    app(FootballApiService::class)->getCountries();

    $this->artisan('football:sync post-match')->assertSuccessful();
    Http::assertSentCount(1);
    expect($fixture->refresh()->final_data_sync_attempts)->toBe(0)
        ->and($fixture->player_stats_sync_attempts)->toBe(0);
});

test('a failed statistics dataset does not block successful events or player data', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $payload = syncTestPayload($fixture);
    unset($payload['statistics']);
    $payload['players'] = array_map(fn (array $lineup) => [
        'team' => $lineup['team'],
        'players' => array_map(fn (array $entry) => ['player' => $entry['player'], 'statistics' => [['games' => ['minutes' => 90]]]], $lineup['startXI']),
    ], syncTestLineups($fixture));
    Http::fake([
        '*/fixtures?*' => Http::response(['response' => [$payload]]),
        '*/fixtures/statistics*' => Http::response([], 503),
    ]);

    $this->artisan('football:sync post-match')->assertFailed();
    expect($fixture->refresh()->statistics_synced_at)->toBeNull()
        ->and($fixture->events_synced_at)->not->toBeNull()
        ->and($fixture->player_stats_synced_at)->not->toBeNull();
    Http::assertSentCount(3);
});

test('historical retries respect backoff and completed datasets', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished', 'match_date' => now('Europe/Brussels')->subYear()]);
    Http::fake(['*' => Http::response(['response' => [syncTestPayload($fixture)]])]);

    $service = app(FixtureSyncService::class);
    expect($service->run('post-match', true, $fixture->id, true))->toBe(0);
    expect($service->run('post-match', true, $fixture->id, true))->toBe(0);
    Http::assertSentCount(1);
    expect($fixture->refresh()->final_data_synced_at)->not->toBeNull();
});

test('odds fetch all pages without repeating earlier pages', function () {
    Http::fakeSequence()
        ->push(['response' => [['id' => 1]], 'paging' => ['total' => 2]])
        ->push(['response' => [['id' => 2]], 'paging' => ['total' => 2]]);
    expect(app(FootballApiService::class)->getFixtureOdds(100))->toBe([['id' => 1], ['id' => 2]]);
    expect(app(FootballApiService::class)->getFixtureOdds(100))->toBe([['id' => 1], ['id' => 2]]);
    Http::assertSentCount(2);
});

test('connections retry at most twice and expired reference cache refreshes', function () {
    Http::fake(['*' => Http::failedConnection()]);
    expect(fn () => app(FootballApiService::class)->getCountries())->toThrow(RuntimeException::class, 'connection error');
    Sleep::assertSleptTimes(1);
});

test('reference cache refreshes after its ttl and keeps query parameters separate', function () {
    Http::fake(['*' => Http::response(['response' => []])]);
    app(FootballApiService::class)->getTeams(1, 2026);
    app(FootballApiService::class)->getTeams(1, 2022);
    app(FootballApiService::class)->getTeams(1, 2026);
    Http::assertSentCount(2);
    $this->travel(8)->days();
    app(FootballApiService::class)->getTeams(1, 2026);
    Http::assertSentCount(3);
});

test('lineups embedded in live responses are reused by the pre match phase', function () {
    $fixture = syncTestFixture(100, ['match_date' => now('Europe/Brussels')->subMinutes(5)]);
    $payload = syncTestPayload($fixture);
    $payload['lineups'] = syncTestLineups($fixture);
    $payload['fixture']['status']['elapsed'] = 5;
    Http::fake(['*' => Http::response(['response' => [$payload]])]);

    $this->artisan('football:sync live')->assertSuccessful();
    $this->artisan('football:sync pre-match')->assertSuccessful();
    Http::assertSentCount(1);
    expect($fixture->refresh()->has_lineups)->toBeTrue();
});

test('a budget exhausted between the batch and fallback does not spend dataset attempts', function () {
    config(['football_sync.max_requests_per_minute' => 1]);
    $fixture = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $payload = syncTestPayload($fixture);
    unset($payload['statistics']);
    Http::fake(['*' => Http::response(['response' => [$payload]])]);

    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->final_data_sync_attempts)->toBe(0)
        ->and($fixture->events_synced_at)->not->toBeNull();
    Http::assertSentCount(1);
});

test('historical api predictions remain unchanged and empty responses preserve existing picks', function () {
    $past = syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $future = syncTestFixture(101, ['status_short' => 'NS', 'status_long' => 'Not Started', 'match_date' => now('Europe/Brussels')->addDay()]);
    foreach ([$past, $future] as $fixture) {
        $fixture->predictions()->create(['source' => 'api', 'home_chance' => 60, 'advice' => 'Saved before kickoff']);
    }
    Http::fake(['*' => Http::response(['response' => []])]);

    $this->artisan('app:add-predictions')->assertSuccessful();
    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => (int) $request['fixture'] === $future->external_id);
    expect($past->apiPrediction->home_chance)->toBe(60.0)->and($future->apiPrediction->home_chance)->toBe(60.0);
});

test('missing final lineups retry without fetching completed player statistics', function () {
    $fixture = syncTestFixture(100, [
        'status_short' => 'FT', 'status_long' => 'Match Finished',
        'final_data_synced_at' => now('UTC'), 'player_stats_synced_at' => now('UTC'),
    ]);
    $payload = syncTestPayload($fixture);
    unset($payload['players']);
    $payload['lineups'] = syncTestLineups($fixture);
    Http::fake(['*/fixtures?*' => Http::response(['response' => [$payload]])]);

    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->has_lineups)->toBeTrue()->and($fixture->player_stats_sync_attempts)->toBe(1);
    $this->travel(16)->minutes();
    $this->artisan('football:sync post-match')->assertSuccessful();
    Http::assertSentCount(1);
});

test('malformed lineup entries cannot mark a fixture complete', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'NS', 'status_long' => 'Not Started', 'match_date' => now('Europe/Brussels')->addMinutes(30)]);
    $lineups = array_map(fn (int $id) => ['team' => ['id' => $id], 'formation' => '4-3-3', 'startXI' => array_fill(0, 11, ['player' => []])], [10, 20]);
    Http::fake(['*' => Http::response(['response' => $lineups])]);

    $this->artisan('football:sync pre-match')->assertSuccessful();
    expect($fixture->refresh()->has_lineups)->toBeFalse();
});

function syncTestFixture(int $externalId, array $attributes = []): Fixture
{
    $league = League::firstOrCreate(['external_id' => 1], ['name' => 'World Cup', 'type' => 'Cup']);
    $home = Team::firstOrCreate(['external_id' => 10], ['name' => 'Home', 'code' => 'HOM', 'logo_url' => 'home.png']);
    $away = Team::firstOrCreate(['external_id' => 20], ['name' => 'Away', 'code' => 'AWA', 'logo_url' => 'away.png']);

    return Fixture::create([
        'external_id' => $externalId, 'league_id' => $league->id, 'home_team_id' => $home->id, 'away_team_id' => $away->id,
        'season' => 2026, 'round_name' => 'Group', 'match_date' => now('Europe/Brussels')->subHour(),
        'status_short' => '1H', 'status_long' => 'First Half', ...$attributes,
    ]);
}

function syncTestPayload(Fixture $fixture): array
{
    return [
        'fixture' => ['id' => $fixture->external_id, 'date' => $fixture->match_date->format('Y-m-d\TH:i:s').'+02:00', 'status' => ['short' => $fixture->status_short, 'long' => $fixture->status_long, 'elapsed' => 30]],
        'league' => ['id' => 1, 'season' => 2026, 'round' => 'Group'],
        'teams' => ['home' => ['id' => 10], 'away' => ['id' => 20]],
        'goals' => ['home' => 1, 'away' => 0],
        'statistics' => array_map(fn (int $id) => ['team' => ['id' => $id], 'statistics' => [['type' => 'Shots on Goal', 'value' => 1]]], [10, 20]),
        'events' => [['team' => ['id' => 10, 'name' => 'Home'], 'time' => ['elapsed' => 12], 'type' => 'Goal', 'detail' => 'Normal Goal']],
        'lineups' => [], 'players' => [],
    ];
}

function syncTestLineups(Fixture $fixture): array
{
    return array_map(fn (int $id) => [
        'team' => ['id' => $id], 'formation' => '4-3-3',
        'startXI' => array_map(fn (int $number) => ['player' => ['id' => $id * 100 + $number, 'name' => 'Player '.$number, 'number' => $number, 'pos' => 'M']], range(1, 11)),
    ], [10, 20]);
}

test('reserve protects the final score and enrichment resumes after the quota resets', function () {
    $fixture = syncTestFixture(100);
    $payload = syncTestPayload($fixture);
    $payload['fixture']['status'] = ['short' => 'FT', 'long' => 'Match Finished'];
    $payload['lineups'] = syncTestLineups($fixture);
    $payload['players'] = array_map(fn (array $lineup) => [
        'team' => $lineup['team'],
        'players' => array_map(fn (array $entry) => ['player' => $entry['player'], 'statistics' => [['games' => ['minutes' => 90]]]], $lineup['startXI']),
    ], $payload['lineups']);
    $budget = app(FootballApiBudget::class);
    $budget->observe(new Illuminate\Http\Client\Response(new Response(200, [
        'x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '400',
    ])));
    Http::fake(['*' => Http::response(['response' => [$payload]])]);

    $this->artisan('football:sync live')->assertSuccessful();
    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->status_short)->toBe('FT')
        ->and($fixture->fulltime_home_goals)->toBe(1)
        ->and($fixture->final_data_sync_attempts)->toBe(0)
        ->and($fixture->player_stats_sync_attempts)->toBe(0)
        ->and($fixture->statistics_synced_at)->toBeNull();
    Http::assertSentCount(1);

    $this->travel(1)->days();
    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->final_data_synced_at)->not->toBeNull()
        ->and($fixture->player_stats_synced_at)->not->toBeNull()
        ->and($fixture->has_lineups)->toBeTrue();
    Http::assertSentCount(2);
});

test('live events remain critical while statistics fallback waits for high priority budget', function () {
    $fixture = syncTestFixture(100);
    $payload = syncTestPayload($fixture);
    unset($payload['events'], $payload['statistics']);
    Http::fake([
        '*/fixtures?*' => Http::response(['response' => [$payload]], 200, ['x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '400']),
        '*/fixtures/events*' => Http::response(['response' => syncTestPayload($fixture)['events']]),
    ]);
    $this->artisan('football:sync live')->assertSuccessful();
    expect($fixture->refresh()->fulltime_home_goals)->toBe(1)
        ->and($fixture->fixtureEvents()->count())->toBe(1);
    Http::assertSentCount(2);
});

test('mixed competition batches map by id and retry only an incomplete fixture', function () {
    config(['api-football.competitions' => '1:2026,39:2025']);
    $other = League::create(['external_id' => 39, 'name' => 'Other', 'type' => 'League']);
    $fixtures = collect(range(100, 120))->map(fn (int $id) => syncTestFixture($id, [
        'status_short' => 'FT', 'status_long' => 'Match Finished',
        'has_lineups' => true, 'player_stats_synced_at' => now('UTC'),
        ...($id % 2 ? ['league_id' => $other->id, 'season' => 2025] : []),
    ]));
    Http::fake(function ($request) use ($fixtures) {
        $selected = $fixtures->whereIn('external_id', explode('-', $request['ids']))->reject(fn ($fixture) => $fixture->external_id === 110);

        return Http::response(['response' => $selected->reverse()->map(function ($fixture) {
            $payload = syncTestPayload($fixture);
            $payload['league']['id'] = $fixture->league->external_id;
            $payload['league']['season'] = $fixture->season;
            $payload['goals']['home'] = $fixture->external_id;

            return $payload;
        })->values()->all()]);
    });
    $this->artisan('football:sync post-match')->assertFailed();
    Http::assertSentCount(2);
    expect(Http::recorded()->map(fn ($record) => $record[0]['ids'])->all())
        ->toBe([implode('-', range(100, 119)), '120']);
    foreach ($fixtures->reject(fn ($fixture) => $fixture->external_id === 110) as $fixture) {
        expect($fixture->refresh()->fulltime_home_goals)->toBe($fixture->external_id)
            ->and($fixture->final_data_synced_at)->not->toBeNull();
    }
    $this->travel(16)->minutes();
    $this->artisan('football:sync post-match')->assertFailed();
    Http::assertSentCount(3);
    Http::assertSent(fn ($request) => $request['ids'] === '110');
});

test('calendar rechecks missing and postponed fixtures outside the rolling window', function (string $status, int $offset, string $updatedStatus, int $newOffset) {
    $fixture = syncTestFixture(100, ['status_short' => $status, 'match_date' => now('Europe/Brussels')->addDays($offset)]);
    Cache::put('football:calendar-imported:v2:1:2026', true, 604800);
    $payload = syncTestPayload($fixture);
    $payload['fixture']['date'] = now('Europe/Brussels')->addDays($newOffset)->toIso8601String();
    $payload['fixture']['status'] = ['short' => $updatedStatus, 'long' => $updatedStatus];
    Http::fake(fn ($request) => Http::response(['response' => isset($request['ids']) ? [$payload] : []]));
    $this->artisan('football:sync fixtures')->assertSuccessful();
    expect($fixture->refresh()->status_short)->toBe($updatedStatus)
        ->and($fixture->match_date->toDateString())->toBe(now('Europe/Brussels')->addDays($newOffset)->toDateString());
    Http::assertSentCount(2);
    Http::assertSent(fn ($request) => ($request['ids'] ?? null) === '100');
})->with([
    'moved beyond two weeks' => ['NS', 1, 'NS', 21],
    'moved months ahead' => ['NS', 1, 'NS', 90],
    'old postponed fixture gets a date' => ['PST', -30, 'NS', 30],
    'cancelled fixture disappears from window' => ['NS', 1, 'CANC', 1],
]);

test('weekly full calendar refresh discovers a new fixture outside the daily window', function () {
    $fixture = syncTestFixture(100, ['status_short' => 'NS', 'match_date' => now('Europe/Brussels')->addDays(60)]);
    Cache::put('football:calendar-imported:v2:1:2026', true, now()->addDays(7));
    $payload = syncTestPayload($fixture);
    $payload['fixture']['id'] = 101;
    $rescheduled = syncTestPayload($fixture);
    $rescheduled['fixture']['date'] = now('Europe/Brussels')->addDays(90)->toIso8601String();
    Http::fake(fn ($request) => Http::response(['response' => isset($request['from']) ? [] : [$payload, $rescheduled]]));
    $this->artisan('football:sync fixtures')->assertSuccessful();
    expect(Fixture::where('external_id', 101)->exists())->toBeFalse();
    $this->travel(8)->days();
    $this->artisan('football:sync fixtures')->assertSuccessful();
    expect(Fixture::where('external_id', 101)->exists())->toBeTrue()
        ->and($fixture->refresh()->match_date->toDateString())->toBe(Carbon::parse($rescheduled['fixture']['date'])->toDateString());
    Http::assertSentCount(2);
});

test('due players import weekly while active squads still refresh daily', function () {
    syncTestFixture(100, ['status_short' => 'NS', 'match_date' => now('Europe/Brussels')->addDays(10)]);
    Http::fake(['*' => Http::response(['response' => [], 'paging' => ['total' => 1]])]);
    $this->artisan('app:add-players --due')->assertSuccessful();
    Http::assertSentCount(3);
    $this->travel(2)->days();
    $this->artisan('app:add-players --due')->assertSuccessful();
    Http::assertSentCount(5);
    $this->travel(6)->days();
    $this->artisan('app:add-players --due')->assertSuccessful();
    Http::assertSentCount(8);
    expect(Http::recorded(fn ($request) => str_contains($request->url(), '/players?'))->count())->toBe(2);
});

test('idle full player imports wait twenty eight days and manual import remains available', function () {
    Http::fake(['*' => Http::response(['response' => [], 'paging' => ['total' => 1]])]);
    $this->artisan('app:add-players --due')->assertSuccessful();
    $this->travel(8)->days();
    $this->artisan('app:add-players --due')->assertSuccessful();
    Http::assertSentCount(1);
    $this->artisan('app:add-players')->assertSuccessful();
    Http::assertSentCount(2);
    $this->travel(29)->days();
    $this->artisan('app:add-players --due')->assertSuccessful();
    Http::assertSentCount(3);
});

test('daily squad refresh discovers players without repeating season pages', function () {
    $fixture = syncTestFixture(100);
    Cache::put('football:players:1:2026:active', true, 604800);
    Http::fake(['*/players/squads*' => Http::response(['response' => [[
        'players' => [['id' => 99001, 'name' => 'New squad player', 'position' => 'Midfielder']],
    ]]])]);
    $this->artisan('app:add-players --due')->assertSuccessful();
    $player = Player::where('external_id', 99001)->firstOrFail();
    expect($fixture->homeTeam->players()->whereKey($player->id)->exists())->toBeTrue()
        ->and(PlayerSeasonStat::count())->toBe(0);
    Http::assertSentCount(2);
});

test('a completed statistics dataset is not refetched when events need another attempt', function () {
    $fixture = syncTestFixture(100, [
        'status_short' => 'FT', 'status_long' => 'Match Finished',
        'has_lineups' => true, 'player_stats_synced_at' => now('UTC'),
    ]);
    $payload = syncTestPayload($fixture);
    $completedPayload = $payload;
    unset($completedPayload['statistics'], $completedPayload['players'], $completedPayload['lineups']);
    $payload['events'] = [];
    Http::fake(['*/fixtures?*' => Http::sequence()->push(['response' => [$payload]])->push(['response' => [$completedPayload]])]);
    $this->artisan('football:sync post-match')->assertSuccessful();
    $completedAt = $fixture->refresh()->statistics_synced_at;
    expect($completedAt)->not->toBeNull()->and($fixture->events_synced_at)->toBeNull();
    $this->travel(16)->minutes();
    $this->artisan('football:sync post-match')->assertSuccessful();
    expect($fixture->refresh()->statistics_synced_at->equalTo($completedAt))->toBeTrue()
        ->and($fixture->final_data_synced_at)->not->toBeNull();
    Http::assertSentCount(2);
});

test('dry run exposes selection and quota deferral without database writes or HTTP', function () {
    syncTestFixture(100, ['status_short' => 'FT', 'status_long' => 'Match Finished']);
    $budget = app(FootballApiBudget::class);
    $budget->observe(new Illuminate\Http\Client\Response(new Response(200, [
        'x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '400',
    ])));
    Http::fake();
    $writes = [];
    DB::listen(function ($event) use (&$writes) {
        if (preg_match('/^\s*(insert|update|delete|replace|create|alter|drop)\b/i', $event->sql)) {
            $writes[] = $event->sql;
        }
    });
    $this->artisan('football:sync post-match --dry-run')
        ->expectsOutputToContain('Kandidaten (exact nu): 1')
        ->expectsOutputToContain('High; quotabeleid: uitgesteld')
        ->expectsOutputToContain('fallbackcalls (schatting): 0–4')->assertSuccessful();
    expect($writes)->toBe([]);
    Http::assertNothingSent();
});
