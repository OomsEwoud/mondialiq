<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\MlImportBatch;
use App\Services\Apis\FootballApiBudget;
use App\Services\Football\CompetitionConfig;
use App\Services\MachineLearning\FixtureDatasetExporter;
use App\Services\MachineLearning\HistoricalDataAudit;
use App\Services\MachineLearning\HistoricalDataImporter;
use App\Services\MachineLearning\HistoricalFixtureContract;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

beforeEach(function () {
    Http::preventStrayRequests();
    Cache::flush();
    config(['services.api_football.base_url' => 'https://football.test', 'services.api_football.api_key' => 'test', 'api-football.ml_competitions' => '39:2022']);
    League::query()->create(['external_id' => 39, 'name' => 'League', 'type' => 'League']);
});

function mlHistoricalPayload(int $id = 101, int $league = 39, int $season = 2022, string $status = 'FT'): array
{
    $date = $season.'-08-01T18:00:00+00:00';

    return ['fixture' => ['id' => $id, 'date' => $date, 'timestamp' => CarbonImmutable::parse($date)->timestamp,
        'status' => ['short' => $status, 'long' => 'Fixture status', 'elapsed' => null], 'venue' => []],
        'league' => ['id' => $league, 'season' => $season, 'name' => 'League', 'round' => 'Round 1'],
        'teams' => ['home' => ['id' => 1, 'name' => 'Home', 'logo' => 'https://example.com/home.png'], 'away' => ['id' => 2, 'name' => 'Away', 'logo' => 'https://example.com/away.png']],
        'goals' => ['home' => $status === 'FT' ? 2 : null, 'away' => $status === 'FT' ? 1 : null],
        'score' => ['fulltime' => ['home' => $status === 'FT' ? 2 : null, 'away' => $status === 'FT' ? 1 : null]]];
}

function mlHistoricalResponse(array $rows): array
{
    return ['response' => $rows, 'errors' => [], 'results' => count($rows), 'paging' => ['current' => 1, 'total' => 1]];
}

test('historical import reuses the fixture service and second run makes no calls or writes', function () {
    Http::fake(['*/fixtures*' => Http::response(mlHistoricalResponse([mlHistoricalPayload()]), 200, ['x-ratelimit-requests-remaining' => '6000', 'x-ratelimit-requests-limit' => '7500'])]);
    $importer = app(HistoricalDataImporter::class);
    expect($importer->run(new CompetitionConfig(39, 2022))['status'])->toBe('imported');
    $before = Fixture::first()->getAttributes();
    expect($importer->run(new CompetitionConfig(39, 2022))['status'])->toBe('already_imported')
        ->and(Fixture::count())->toBe(1)->and(Fixture::first()->getAttributes())->toBe($before)
        ->and(Fixture::first()->getRawOriginal('match_date'))->toBe('2022-08-01 20:00:00')
        ->and(MlImportBatch::first()->next_index)->toBe(1)
        ->and(app(FootballApiBudget::class)->effectiveRemaining())->toBe(6000);
    Http::assertSentCount(1);
});

test('historical plan and dry run make no writes or provider requests', function () {
    $this->artisan('ml:data plan')->assertSuccessful();
    $this->artisan('ml:data import --dry-run')->assertSuccessful();
    expect(MlImportBatch::count())->toBe(0)->and(Fixture::count())->toBe(0);
    Http::assertNothingSent();
});

test('historical selection supports explicit multiple leagues and seasons deterministically', function () {
    Http::fake(function ($request) {
        if (str_contains($request->url(), '/leagues')) {
            return Http::response(['response' => [['league' => ['id' => (int) $request['id'], 'name' => 'Cup', 'type' => 'Cup'], 'seasons' => [['year' => (int) $request['season']]]]], 'errors' => []]);
        }

        return Http::response(mlHistoricalResponse([mlHistoricalPayload((int) $request['league'] * 10000 + (int) $request['season'], (int) $request['league'], (int) $request['season'])]));
    });
    $this->artisan('ml:data import --league=39 --league=140 --from-season=2021 --to-season=2022')->assertSuccessful();
    expect(Fixture::count())->toBe(4)->and(MlImportBatch::count())->toBe(4)->and(League::where('external_id', 140)->first()->type)->toBe('Cup');
    Http::assertSentCount(5);
});

test('historical contract rejects malformed data before storing fixtures or snapshot', function (string $field, mixed $value) {
    $row = mlHistoricalPayload();
    data_set($row, $field, $value);
    Http::fake(['*' => Http::response(mlHistoricalResponse([$row]))]);
    $this->artisan('ml:data import')->assertFailed();
    expect(Fixture::count())->toBe(0)->and(MlImportBatch::count())->toBe(0);
})->with([
    ['score.fulltime.home', -1], ['score.fulltime.home', null], ['score.fulltime.home', 100],
    ['fixture.date', '2022-08-01 18:00:00'], ['fixture.timestamp', 123],
    ['league.id', 140], ['league.season', 2023], ['teams.away.id', 1], ['fixture.id', 99000001],
    ['fixture.status.short', 'FINISHED'], ['goals.home', 3],
]);

test('historical non FT statuses are preserved without manufacturing results', function (string $status) {
    Http::fake(['*' => Http::response(mlHistoricalResponse([mlHistoricalPayload(status: $status)]))]);
    $this->artisan('ml:data import')->assertSuccessful();
    expect(Fixture::first()->status_short)->toBe($status)->and(Fixture::first()->fulltime_home_goals)->toBeNull()
        ->and(app(HistoricalDataAudit::class)->inspect(new CompetitionConfig(39, 2022))['ft'])->toBe(0);
})->with(['PST', 'CANC', 'ABD', 'NS']);

test('historical duplicate and incomplete responses cannot mark season imported', function (string $kind) {
    $response = mlHistoricalResponse([mlHistoricalPayload()]);
    if ($kind === 'duplicate') {
        $response = mlHistoricalResponse([mlHistoricalPayload(), mlHistoricalPayload()]);
    } elseif ($kind === 'paging') {
        $response['paging']['total'] = 2;
    } else {
        $response['results'] = 99;
    }
    Http::fake(['*' => Http::response($response)]);
    $this->artisan('ml:data import')->assertFailed();
    expect(MlImportBatch::count())->toBe(0)->and(Fixture::count())->toBe(0);
})->with(['duplicate', 'paging', 'count']);

test('historical quota deferral preserves state and sends no request', function () {
    $budget = app(FootballApiBudget::class);
    Cache::put($budget->key().':paused', true, 60);
    $this->artisan('ml:data import')->assertSuccessful();
    expect(MlImportBatch::count())->toBe(0);
    Http::assertNothingSent();
});

test('historical import preserves a final result conflict and resumes the saved snapshot', function () {
    Http::fake(['*' => Http::response(mlHistoricalResponse([mlHistoricalPayload()]))]);
    $importer = app(HistoricalDataImporter::class);
    $competition = new CompetitionConfig(39, 2022);
    $importer->run($competition);
    Fixture::first()->update(['fulltime_home_goals' => 9]);
    expect(fn () => $importer->run($competition, true))->toThrow(RuntimeException::class, 'conflict');
    expect(Fixture::first()->fulltime_home_goals)->toBe(9)->and(MlImportBatch::latest('id')->first()->completed_at)->toBeNull();
    Fixture::first()->update(['fulltime_home_goals' => 2]);
    expect($importer->run($competition)['status'])->toBe('imported');
    Http::assertSentCount(1); // Explicit refresh reused the central client's short response cache.
});

test('historical audit flags team kickoff duplicates and possible schedule gaps', function () {
    $later = mlHistoricalPayload(103);
    $later['fixture']['date'] = '2022-11-01T18:00:00+00:00';
    $later['fixture']['timestamp'] = CarbonImmutable::parse($later['fixture']['date'])->timestamp;
    Http::fake(['*' => Http::response(mlHistoricalResponse([mlHistoricalPayload(), mlHistoricalPayload(102), $later]))]);
    $this->artisan('ml:data import')->assertSuccessful();
    $audit = app(HistoricalDataAudit::class)->inspect(new CompetitionConfig(39, 2022));
    expect(array_column($audit['issues'], 'issue'))->toContain('duplicate_team_kickoff')
        ->and(array_values($audit['team_coverage'])[0]['possible_gaps'])->not->toBeEmpty();
});

test('historical export has chronological rows stable fingerprint and provenance', function () {
    $later = mlHistoricalPayload(100);
    $later['fixture']['date'] = '2022-09-01T18:00:00+00:00';
    $later['fixture']['timestamp'] = CarbonImmutable::parse($later['fixture']['date'])->timestamp;
    Http::fake(['*' => Http::response(mlHistoricalResponse([$later, mlHistoricalPayload()]))]);
    $this->artisan('ml:data import')->assertSuccessful();
    $exporter = app(FixtureDatasetExporter::class);
    $a = $exporter->export('Europe/Brussels');
    $b = $exporter->export('Europe/Brussels');
    $summary = json_decode(file_get_contents($a.'.summary.json'), true);
    $lines = file($a, FILE_IGNORE_NEW_LINES);
    expect($summary['dataset_rows_sha256'])->toBe(json_decode(file_get_contents($b.'.summary.json'), true)['dataset_rows_sha256'])
        ->and($summary['dataset_rows_sha256'])->toBe(hash('sha256', $lines[1]."\n".$lines[2]."\n"))
        ->and($summary['sha256'])->toBe(hash_file('sha256', $a))
        ->and($summary['fixtures'])->toBe(2)->and($summary['provenance'])->toHaveCount(1)
        ->and(json_decode($lines[1], true)['external_id'])->toBe(101);
});

test('historical import resumes after a committed fixture without repeating the season request', function () {
    $rows = [mlHistoricalPayload(), mlHistoricalPayload(102)];
    $batch = MlImportBatch::create(['provider_league_id' => 39, 'season' => 2022, 'payload' => $rows,
        'payload_sha256' => app(HistoricalFixtureContract::class)->checksum($rows), 'fetched_at' => now(), 'next_index' => 0]);
    $importer = app(HistoricalDataImporter::class);
    $importer->run(new CompetitionConfig(39, 2022));
    $first = Fixture::where('external_id', 101)->first()->getAttributes();
    $batch->update(['next_index' => 1, 'completed_at' => null]);
    expect($importer->run(new CompetitionConfig(39, 2022))['status'])->toBe('imported')
        ->and(Fixture::where('external_id', 101)->first()->getAttributes())->toBe($first)
        ->and(Fixture::count())->toBe(2);
    Http::assertNothingSent();
});

test('historical invalid selection never calls provider', function (string $options) {
    $this->artisan('ml:data plan '.$options)->assertFailed();
    Http::assertNothingSent();
})->with(['--league=abc --season=2022', '--league=39', '--league=39 --from-season=2023 --to-season=2022', '--league=39 --season=2200']);

test('historical provider error and rate limit do not save completion markers', function (int $status) {
    Sleep::fake();
    Http::fake(['*' => Http::response(['errors' => ['message' => 'Unavailable'], 'response' => []], $status, ['Retry-After' => '60'])]);
    $this->artisan('ml:data import')->assertFailed();
    expect(MlImportBatch::count())->toBe(0)->and(Fixture::count())->toBe(0);
    Http::assertSentCount($status === 500 ? 2 : 1);
})->with([429, 500, 200]);

test('historical snapshot checksum survives JSON object key reordering', function () {
    $contract = app(HistoricalFixtureContract::class);
    $row = mlHistoricalPayload();
    $reordered = array_reverse($row, true);
    $reordered['fixture'] = array_reverse($reordered['fixture'], true);
    expect($contract->checksum([$row]))->toBe($contract->checksum([$reordered]));
    $reordered['goals']['home'] = 9;
    expect($contract->checksum([$row]))->not->toBe($contract->checksum([$reordered]));
});
