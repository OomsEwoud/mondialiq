<?php

use App\Jobs\SyncFootballBatch;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use App\Services\Fixture\FixtureService;
use App\Services\Football\CompetitionConfig;
use App\Services\Standing\StandingService;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.api_football.base_url' => 'https://api-football.test', 'services.api_football.api_key' => 'competition-test', 'api-football.competitions' => '39:2026,140:2025']);
    Http::preventStrayRequests();
});

test('competition pairs are explicit deduplicated and preserve distinct seasons', function () {
    config(['api-football.competitions' => '39:2026, 140:2025,39:2026,39:2025']);
    expect(array_map(fn ($pair) => $pair->key(), CompetitionConfig::configured()))->toBe(['39:2026', '140:2025', '39:2025']);
});

test('invalid competition configuration fails before HTTP', function (string $value) {
    config(['api-football.competitions' => $value]);
    Http::fake();
    $this->artisan('football:sync fixtures')->assertFailed();
    Http::assertNothingSent();
})->with(['39', 'abc:2026', '39:26', '0:2026', '39:2026,', '39:9999', '39:2026:2025']);

test('legacy config remains supported when no explicit pairs are configured', function () {
    config(['api-football.competitions' => null, 'services.api_football.league_id' => 1, 'services.api_football.season' => 2026]);
    expect(CompetitionConfig::configured()[0]->key())->toBe('1:2026');
});

test('fixture scope does not create a league season cross product', function () {
    $england = League::query()->create(['external_id' => 39, 'name' => 'Premier League', 'type' => 'League']);
    $spain = League::query()->create(['external_id' => 140, 'name' => 'La Liga', 'type' => 'League']);
    $yes = competitionTestFixture(['league_id' => $england->id, 'season' => 2026]);
    $other = competitionTestFixture(['league_id' => $spain->id, 'season' => 2025]);
    competitionTestFixture(['league_id' => $england->id, 'season' => 2025]);
    competitionTestFixture(['league_id' => $spain->id, 'season' => 2026]);
    expect(Fixture::query()->forConfiguredCompetition()->orderBy('id')->pluck('id')->all())->toBe([$yes->id, $other->id]);
});

test('legacy fixture importer visits all configured pairs without cross products', function () {
    Http::fake(['*' => Http::response(['response' => []])]);
    $this->artisan('app:add-fixtures')->assertSuccessful();
    Http::assertSentCount(2);
    Http::assertSent(fn ($request) => $request['league'] === 39 && $request['season'] === 2026);
    Http::assertSent(fn ($request) => $request['league'] === 140 && $request['season'] === 2025);
});

test('dry run requires no API requests or queue dispatches', function () {
    config(['services.api_football.api_key' => null]);
    Bus::fake();
    Http::fake();
    $this->artisan('football:sync --dry-run')->expectsOutputToContain('39:2026')->expectsOutputToContain('/fixtures')->assertSuccessful();
    Http::assertNothingSent();
    Bus::assertNothingDispatched();
});

test('queue mode uses at most twenty fixtures per job across competitions', function () {
    Bus::fake();
    Http::fake();
    $league = League::query()->create(['external_id' => 39, 'name' => 'Premier League', 'type' => 'League']);
    foreach (range(1, 21) as $id) {
        competitionTestFixture(['external_id' => $id, 'league_id' => $league->id, 'season' => 2026]);
    }
    $this->artisan('football:sync live --queue')->assertSuccessful();
    Bus::assertDispatchedTimes(SyncFootballBatch::class, 2);
    Bus::assertDispatched(SyncFootballBatch::class, fn ($job) => count($job->fixtureIds) === 20);
    Http::assertNothingSent();
});

test('live sync switch does not dispatch jobs or consume quota', function () {
    config(['api-football.live_sync_enabled' => false]);
    Bus::fake();
    Http::fake();
    $this->artisan('football:sync live --queue')->assertSuccessful();
    Bus::assertNothingDispatched();
    Http::assertNothingSent();
});

function competitionTestFixture(array $attributes): Fixture
{
    $home = Team::firstOrCreate(['external_id' => 10], ['name' => 'Home', 'code' => 'HOM', 'logo_url' => 'home.png']);
    $away = Team::firstOrCreate(['external_id' => 20], ['name' => 'Away', 'code' => 'AWA', 'logo_url' => 'away.png']);

    return Fixture::query()->create([
        'external_id' => 1000 + Fixture::query()->count(), 'home_team_id' => $home->id, 'away_team_id' => $away->id,
        'round_name' => 'Round 1', 'match_date' => now('Europe/Brussels')->subMinutes(10),
        'status_short' => '1H', 'status_long' => 'First Half', ...$attributes,
    ]);
}

test('reference imports resume pagination after budget deferral without refetching cached pages', function () {
    config(['football_sync.max_requests_per_minute' => 6]);
    Http::fake(function ($request) {
        $pages = str_contains($request->url(), '/players?') && $request['league'] === 39 ? 2 : 1;

        return Http::response(['response' => [], 'paging' => ['total' => $pages]]);
    });
    $this->artisan('football:sync reference-data')->assertSuccessful();
    Http::assertSentCount(6);
    $this->travel(61)->seconds();
    $this->artisan('football:sync reference-data')->assertSuccessful();
    Http::assertSentCount(8);
    $this->artisan('football:sync reference-data')->assertSuccessful();
    Http::assertSentCount(8);
});

test('standings use the external league identity even when names collide', function () {
    League::query()->create(['external_id' => 39, 'name' => 'Premier League', 'type' => 'League']);
    $correct = League::query()->create(['external_id' => 140, 'name' => 'Premier League', 'type' => 'League']);
    $fixture = competitionTestFixture(['league_id' => $correct->id, 'season' => 2025]);
    $payload = [['league' => ['id' => 140, 'name' => 'Premier League', 'season' => 2025,
        'standings' => [[['team' => ['id' => 10], 'group' => 'League', 'rank' => 1, 'points' => 12]]]]]];
    app(StandingService::class)->storeStandings($payload);
    app(StandingService::class)->storeStandings($payload);
    expect(Standing::query()->count())->toBe(1)
        ->and(Standing::query()->first()->league_id)->toBe($correct->id);
});

test('routine calendar refresh uses a date window after a complete initial import', function () {
    config(['api-football.competitions' => '39:2026']);
    League::query()->create(['external_id' => 39, 'name' => 'Premier League', 'type' => 'League']);
    $fixtureService = Mockery::mock(FixtureService::class);
    $fixtureService->shouldReceive('storeFixtures')->twice()->andReturn(['imported' => 1]);
    app()->instance(FixtureService::class, $fixtureService);
    Http::fake(['*' => Http::response(['response' => [['fixture' => ['id' => 123]]]])]);
    $this->artisan('football:sync fixtures')->assertSuccessful();
    $this->travel(1)->days();
    $this->artisan('football:sync fixtures')->assertSuccessful();
    Http::assertSentCount(2);
    Http::assertSent(fn ($request) => $request['league'] === 39 && isset($request['from'], $request['to']));
});
