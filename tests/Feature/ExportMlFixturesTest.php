<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\MachineLearning\FixtureDatasetExporter;
use Illuminate\Support\Facades\Http;

test('ML export requires an explicit valid kickoff timezone', function (?string $timezone) {
    Http::preventStrayRequests();
    $options = $timezone === null ? [] : ['--kickoff-timezone' => $timezone];
    $this->artisan('ml:export', $options)->assertFailed();
    Http::assertNothingSent();
})->with([null, 'not-a-timezone']);

test('ML export contains only whitelisted local fixture data without writes or HTTP', function () {
    Http::preventStrayRequests();
    $league = League::query()->create(['name' => 'Test League', 'type' => 'League']);
    $home = Team::query()->create(['name' => 'Home', 'logo_url' => 'https://example.com/home.png']);
    $away = Team::query()->create(['name' => 'Away', 'logo_url' => 'https://example.com/away.png']);
    $fixture = Fixture::query()->create([
        'external_id' => 1234, 'league_id' => $league->id,
        'home_team_id' => $home->id, 'away_team_id' => $away->id,
        'season' => 2025, 'round_name' => 'Round 1', 'status_short' => 'FT',
        'status_long' => 'Match Finished', 'match_date' => '2025-07-01 20:00:00',
        'fulltime_home_goals' => 2, 'fulltime_away_goals' => null,
    ]);
    $before = $fixture->fresh()->getAttributes();
    $path = app(FixtureDatasetExporter::class)->export('Europe/Brussels');
    $lines = array_map(fn (string $line): array => json_decode($line, true, flags: JSON_THROW_ON_ERROR), file($path, FILE_IGNORE_NEW_LINES));

    expect($lines[0]['schema_version'])->toBe(1)
        ->and($lines[0]['availability_policy'])->toBe('latest-recorded-state-v1')
        ->and($lines[1]['kickoff'])->toBe('2025-07-01T18:00:00+00:00')
        ->and($lines[1]['fulltime_away_goals'])->toBeNull()
        ->and(array_keys($lines[1]))->toBe([
            'id', 'external_id', 'league_id', 'season', 'home_team_id', 'away_team_id',
            'status_short', 'fulltime_home_goals', 'fulltime_away_goals',
            'created_at', 'updated_at', 'fixture_basics_synced_at', 'kickoff',
        ])
        ->and($lines[2])->toBe(['export_complete' => true, 'row_count' => 1])
        ->and($fixture->fresh()->getAttributes())->toBe($before)
        ->and(Fixture::query()->count())->toBe(1);
    Http::assertNothingSent();
});
