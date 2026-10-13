<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiBudget;
use App\Services\Fixture\FixtureOddsService;
use App\Services\Football\PrematchSyncService;
use App\Services\Prediction\PredictionService;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

beforeEach(function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 1, 12, 0, 0, 'Europe/Brussels'));
    config(['services.api_football.base_url' => 'https://api-football.test', 'services.api_football.api_key' => 'market-test',
        'api-football.competitions' => '39:2026,140:2025', 'football_sync.max_requests_per_minute' => 200]);
    Http::preventStrayRequests();
    Sleep::fake();
});

afterEach(fn () => Carbon::setTestNow());

function marketFixture(int $id = 100, int $hours = 240, int $leagueId = 39, int $season = 2026, string $status = 'NS'): Fixture
{
    $league = League::firstOrCreate(['external_id' => $leagueId], ['name' => 'League '.$leagueId, 'type' => 'League']);
    $home = Team::firstOrCreate(['external_id' => 10], ['name' => 'Home', 'code' => 'HOM', 'logo_url' => 'home.png']);
    $away = Team::firstOrCreate(['external_id' => 20], ['name' => 'Away', 'code' => 'AWA', 'logo_url' => 'away.png']);

    return Fixture::create(['external_id' => $id, 'league_id' => $league->id, 'season' => $season,
        'home_team_id' => $home->id, 'away_team_id' => $away->id, 'round_name' => 'Round 1',
        'match_date' => now('Europe/Brussels')->addHours($hours), 'status_short' => $status, 'status_long' => $status === 'NS' ? 'Not Started' : $status]);
}

function marketOdds(int $id, string $odd = '2.00'): array
{
    return ['fixture' => ['id' => $id], 'bookmakers' => [['id' => 1, 'name' => 'Example',
        'bets' => [['id' => 1, 'name' => 'Match Winner', 'values' => [['value' => 'Home', 'odd' => $odd]]]]]]];
}

function marketPrediction(): array
{
    return ['predictions' => ['percent' => ['home' => '60%', 'draw' => '20%', 'away' => '20%'], 'advice' => 'Home']];
}

test('prematch freshness uses the distance to kickoff', function (string $dataset, int $hours, int $ttl) {
    marketFixture(hours: $hours);
    Http::fake(['*' => Http::response(['response' => [$dataset === 'odds' ? marketOdds(100) : marketPrediction()]])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    $this->travel($ttl - 1)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(1);
    $this->travel(1)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(2);
})->with([
    ['odds', 240, 24], ['odds', 120, 12], ['odds', 36, 6], ['odds', 18, 6],
    ['predictions', 336, 72], ['predictions', 144, 48], ['predictions', 36, 24],
]);

test('entering a closer kickoff band shortens the refresh interval', function (string $dataset, int $elapsed) {
    marketFixture(hours: 54);
    Http::fake(['*' => Http::response(['response' => [$dataset === 'odds' ? marketOdds(100) : marketPrediction()]])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    $this->travel($elapsed)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(2);
})->with([['odds', 7], ['predictions', 25]]);

test('recent local data is reused before freshness markers exist', function (string $dataset) {
    $fixture = marketFixture();
    if ($dataset === 'odds') {
        app(FixtureOddsService::class)->storeFixtureOdds([marketOdds(100)], $fixture->id);
    } else {
        app(PredictionService::class)->storeApiPrediction([marketPrediction()], $fixture->id);
    }
    Http::fake();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertNothingSent();
})->with(['odds', 'predictions']);

test('automatic prematch refresh excludes past finished cancelled postponed and distant fixtures', function (string $dataset) {
    marketFixture(100, -1);
    marketFixture(101, 12, status: 'FT');
    marketFixture(102, 12, status: 'CANC');
    marketFixture(103, 12, status: 'PST');
    marketFixture(104, 24 * 15);
    marketFixture(105, 12, leagueId: 39, season: 2025);
    Http::fake();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertNothingSent();
})->with(['odds', 'predictions']);

test('a postponed fixture and a changed kickoff become candidates again', function (string $dataset) {
    $fixture = marketFixture(status: 'PST');
    Http::fake(['*' => Http::response(['response' => [$dataset === 'odds' ? marketOdds(100) : marketPrediction()]])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertNothingSent();
    $fixture->update(['status_short' => 'NS', 'status_long' => 'Not Started', 'match_date' => now('Europe/Brussels')->addDays(12)]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    $this->travel(25)->hours();
    $fixture->update(['match_date' => now('Europe/Brussels')->addDays(13)]);
    expect(app(PrematchSyncService::class)->plan($dataset)['due'])->toBe(1);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(2);
})->with(['odds', 'predictions']);

test('empty responses have bounded attempts per band and preserve saved predictions', function (string $dataset, int $interval) {
    $fixture = marketFixture(hours: 336);
    Http::fake(['*' => Http::response(['response' => []])]);
    foreach (range(1, 3) as $attempt) {
        $this->artisan('app:add-'.$dataset)->assertSuccessful();
        $this->artisan('app:add-'.$dataset)->assertSuccessful();
        if ($attempt < 3) {
            $this->travel($interval)->hours();
        }
    }
    $this->travel(1)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(3);
    $fixture->update(['match_date' => now('Europe/Brussels')->addHours(36)]);
    expect(app(PrematchSyncService::class)->plan($dataset)['due'])->toBe(1);
})->with([['odds', 24], ['predictions', 72]]);

test('normal quota deferral leaves prematch markers and retry counts untouched', function (string $dataset, int $remaining) {
    $fixture = marketFixture();
    app(FootballApiBudget::class)->observe(new Illuminate\Http\Client\Response(new Response(200, [
        'x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => (string) $remaining,
    ])));
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertNothingSent();
    expect(Cache::has('football:prematch:'.$dataset.':'.$fixture->league_id.':2026:100'))->toBeFalse();
    $this->travel(1)->days();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(1);
})->with(['odds', 'predictions'])->with([600, 400, 0]);

test('warning and unknown quota permit normal requests', function (bool $known) {
    marketFixture();
    if ($known) {
        app(FootballApiBudget::class)->observe(new Illuminate\Http\Client\Response(new Response(200, [
            'x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '1500',
        ])));
    }
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(1);
})->with([true, false]);

test('prematch failures back off and stop after three attempts in a band', function () {
    marketFixture();
    Http::fake(['*' => Http::response([], 503)]);
    $this->artisan('app:add-odds')->assertFailed();
    $this->artisan('app:add-odds')->assertSuccessful();
    $this->travel(1)->hours();
    $this->artisan('app:add-odds')->assertFailed();
    $this->travel(2)->hours();
    $this->artisan('app:add-odds')->assertFailed();
    $this->travel(6)->hours();
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(6);
});

test('odds groups use league season and UTC date with all pages and correct fixture mapping', function () {
    $one = marketFixture(100, 36);
    $two = marketFixture(101, 37);
    $three = marketFixture(102, 36, 140, 2025);
    config(['api-football.competitions' => '39:2026,140:2025,39:2026']);
    Http::fake(function ($request) {
        if (isset($request['fixture'])) {
            return Http::response(['response' => [marketOdds(102, '4.00')]]);
        }
        expect($request['league'])->toBe(39)->and($request['season'])->toBe(2026)->and($request['date'])->toBe('2026-06-02');

        return Http::response(['response' => $request['page'] === 1 ? [marketOdds(101, '3.00'), marketOdds(999)] : [marketOdds(100)], 'paging' => ['total' => 2]]);
    });
    $this->artisan('app:add-odds')->assertSuccessful();
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(3);
    expect($one->fixtureOdds()->first()->odd)->toBe(2.0)->and($two->fixtureOdds()->first()->odd)->toBe(3.0)
        ->and($three->fixtureOdds()->first()->odd)->toBe(4.0);
});

test('odds uses a fixture query when the rest of the matchday is still fresh', function () {
    $one = marketFixture(100);
    marketFixture(101);
    app(FixtureOddsService::class)->storeFixtureOdds([marketOdds(100)], $one->id);
    Http::fake(['*' => Http::response(['response' => [marketOdds(101)]])]);
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => ($request['fixture'] ?? null) === 101 && ! isset($request['league']));
});

test('dataset locks protect concurrent command entrypoints', function () {
    $fixture = marketFixture();
    $lock = Cache::lock('football:prematch:odds:'.$fixture->league_id.':2026:100:lock', 3600);
    $lock->get();
    Http::fake();
    try {
        $this->artisan('app:add-odds')->assertSuccessful();
        $this->artisan('football:sync odds')->assertSuccessful();
        Http::assertNothingSent();
    } finally {
        $lock->release();
    }
});

test('standings without fixtures uses a weekly safety refresh and shares markers with legacy command', function () {
    config(['api-football.competitions' => '39:2026']);
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('football:sync standings')->assertSuccessful();
    $this->travel(1)->hours();
    $this->artisan('app:add-standings')->assertSuccessful();
    Http::assertSentCount(1);
    $this->travel(7)->days();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(2);
});

test('standings refresh follows match activity final results and separate season markers', function () {
    $fixture = marketFixture(hours: 10);
    marketFixture(101, 72, 140, 2025);
    Http::fake(fn ($request) => Http::response(['response' => [['league' => ['id' => $request['league'], 'season' => $request['season'], 'standings' => []]]]]));
    $this->artisan('football:sync standings')->assertSuccessful();
    $this->travel(1)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(2);
    $fixture->update(['status_short' => 'FT', 'status_long' => 'Match Finished', 'match_date' => now('Europe/Brussels')->subHours(2), 'fulltime_home_goals' => 1]);
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(3);
    $this->travel(1)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(4);
    $this->travel(22)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    expect(Http::recorded(fn ($request) => $request['league'] === 140)->count())->toBe(2);
});

test('empty standings coverage does not poll hourly on matchday', function () {
    config(['api-football.competitions' => '39:2026']);
    marketFixture(hours: -1, status: '1H');
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('football:sync standings')->assertSuccessful();
    $this->travel(1)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(1);
    $this->travel(23)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(2);
});

test('standings quota deferral does not update state', function () {
    config(['api-football.competitions' => '39:2026']);
    app(FootballApiBudget::class)->observe(new Illuminate\Http\Client\Response(new Response(200, [
        'x-ratelimit-requests-limit' => '7500', 'x-ratelimit-requests-remaining' => '400',
    ])));
    Http::fake();
    $this->artisan('app:add-standings')->assertSuccessful();
    expect(Cache::has('football:standings:v2:39:2026'))->toBeFalse();
    Http::assertNothingSent();
});

test('market dry runs are read only and report local due counts', function (string $phase) {
    marketFixture();
    marketFixture(101, status: 'CANC');
    Http::fake();
    Bus::fake();
    $writes = [];
    DB::listen(function ($event) use (&$writes) {
        if (preg_match('/^\s*(insert|update|delete|replace|create|alter|drop)\b/i', $event->sql)) {
            $writes[] = $event->sql;
        }
    });
    $before = app(PrematchSyncService::class)->plan('odds')['due'];
    $this->artisan('football:sync '.$phase.' --dry-run')->expectsOutputToContain('Prioriteit: Normal')
        ->expectsOutputToContain('due:')->expectsOutputToContain('39:2026')->assertSuccessful();
    expect($writes)->toBe([])->and(app(PrematchSyncService::class)->plan('odds')['due'])->toBe($before);
    Http::assertNothingSent();
    Bus::assertNothingDispatched();
})->with(['odds', 'predictions', 'standings']);

test('cached responses after rescheduling do not extend the last observation age', function (string $dataset, int $ttl) {
    $fixture = marketFixture(hours: 336);
    Http::fake(['*' => Http::response(['response' => [$dataset === 'odds' ? marketOdds(100) : marketPrediction()]])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    $this->travel(1)->hours();
    $fixture->update(['match_date' => now('Europe/Brussels')->addDays(13)]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(1);
    $this->travel($ttl - 1)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(2);
})->with([['odds', 24], ['predictions', 72]]);

test('prematch data is not refreshed after kickoff', function (string $dataset) {
    marketFixture(hours: 2);
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    $this->travel(3)->hours();
    $this->artisan('app:add-'.$dataset)->assertSuccessful();
    Http::assertSentCount(1);
})->with(['odds', 'predictions']);

test('quota deferral during grouped odds pagination resumes cached pages without retry loss', function () {
    $one = marketFixture(100);
    marketFixture(101);
    Http::fake(function ($request) {
        return Http::response(['response' => [marketOdds($request['page'] === 1 ? 100 : 101)], 'paging' => ['total' => 2]], 200,
            $request['page'] === 1 ? ['X-RateLimit-Remaining' => '0'] : []);
    });
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(1);
    expect(Cache::has('football:prematch:odds:'.$one->league_id.':2026:100'))->toBeFalse()
        ->and($one->fixtureOdds()->count())->toBe(0);
    $this->travel(61)->seconds();
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(2);
    expect($one->fixtureOdds()->count())->toBe(1)->and(app(PrematchSyncService::class)->plan('odds')['due'])->toBe(0);
});

test('a first final result retries standings even after empty preseason coverage', function () {
    config(['api-football.competitions' => '39:2026']);
    $fixture = marketFixture(hours: 2);
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('football:sync standings')->assertSuccessful();
    $this->travel(4)->hours();
    $fixture->update(['status_short' => 'FT', 'status_long' => 'Match Finished', 'fulltime_home_goals' => 1]);
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(2);
    $this->travel(1)->hours();
    $this->artisan('football:sync standings')->assertSuccessful();
    Http::assertSentCount(2);
});

test('a complete due matchday replaces ten fixture requests with one odds request', function () {
    $fixtures = collect(range(100, 109))->map(fn (int $id) => marketFixture($id));
    Http::fake(['*' => Http::response(['response' => $fixtures->reverse()->map(fn (Fixture $fixture) => marketOdds($fixture->external_id))->values()->all(), 'paging' => ['total' => 1]])]);
    $this->artisan('app:add-odds')->assertSuccessful();
    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => ($request['league'] ?? null) === 39 && ! isset($request['fixture']));
    foreach ($fixtures as $fixture) {
        expect($fixture->fixtureOdds()->count())->toBe(1);
    }
});
