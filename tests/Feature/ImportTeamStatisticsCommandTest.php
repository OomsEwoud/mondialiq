<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\TeamStatisticsService;
use Mockery\MockInterface;

beforeEach(function () {
    $this->league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $this->homeTeam = Team::create([
        'external_id' => 601,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $this->awayTeam = Team::create([
        'external_id' => 602,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);
});

test('the import team statistics command imports a specific combination', function () {
    $statisticsKey = "{$this->homeTeam->external_id}-{$this->league->external_id}-2026-season";

    $this->mock(TeamStatisticsService::class, function (MockInterface $mock) use ($statisticsKey) {
        $mock->shouldReceive('findExisting')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026, null)
            ->andReturn(null);
        $mock->shouldReceive('teamHasFixtureToday')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026)
            ->andReturn(true);
        $mock->shouldReceive('shouldRefresh')
            ->once()
            ->with(null, true, false)
            ->andReturn(true);
        $mock->shouldReceive('importForTeam')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026, null, false)
            ->andReturn(new TeamStatistic(['statistics_key' => $statisticsKey]));
    });

    $this->artisan("app:import-team-statistics --team_id={$this->homeTeam->external_id} --league_id={$this->league->external_id} --season=2026")
        ->expectsOutput("Imported {$statisticsKey}")
        ->assertSuccessful();
});

test('the import team statistics command skips fresh statistics', function () {
    $this->mock(TeamStatisticsService::class, function (MockInterface $mock) {
        $existing = new TeamStatistic(['statistics_key' => 'fresh-key']);

        $mock->shouldReceive('findExisting')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026, null)
            ->andReturn($existing);
        $mock->shouldReceive('teamHasFixtureToday')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026)
            ->andReturn(false);
        $mock->shouldReceive('shouldRefresh')
            ->once()
            ->with($existing, false, false)
            ->andReturn(false);
        $mock->shouldNotReceive('importForTeam');
    });

    $this->artisan("app:import-team-statistics --team_id={$this->homeTeam->external_id} --league_id={$this->league->external_id} --season=2026")
        ->expectsOutput("Skipped {$this->homeTeam->external_id}/{$this->league->external_id}/2026, statistics zijn nog vers.")
        ->assertSuccessful();
});

test('the import team statistics command imports relevant teams from fixtures', function () {
    Fixture::create([
        'external_id' => 8001,
        'league_id' => $this->league->id,
        'home_team_id' => $this->homeTeam->id,
        'away_team_id' => $this->awayTeam->id,
        'round_name' => 'Group Stage',
        'season' => 2026,
        'match_date' => now('UTC')->addHours(3),
        'status_long' => 'Not Started',
    ]);

    $this->mock(TeamStatisticsService::class, function (MockInterface $mock) {
        $mock->shouldReceive('findExisting')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026, null)
            ->andReturn(null);
        $mock->shouldReceive('teamHasFixtureToday')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026)
            ->andReturn(true);
        $mock->shouldReceive('shouldRefresh')
            ->once()
            ->with(null, true, false)
            ->andReturn(true);
        $mock->shouldReceive('importForTeam')
            ->once()
            ->with($this->homeTeam->external_id, $this->league->external_id, 2026, null, false)
            ->andReturn(new TeamStatistic(['statistics_key' => "{$this->homeTeam->external_id}-{$this->league->external_id}-2026-season"]));

        $mock->shouldReceive('findExisting')
            ->once()
            ->with($this->awayTeam->external_id, $this->league->external_id, 2026, null)
            ->andReturn(null);
        $mock->shouldReceive('teamHasFixtureToday')
            ->once()
            ->with($this->awayTeam->external_id, $this->league->external_id, 2026)
            ->andReturn(true);
        $mock->shouldReceive('shouldRefresh')
            ->once()
            ->with(null, true, false)
            ->andReturn(true);
        $mock->shouldReceive('importForTeam')
            ->once()
            ->with($this->awayTeam->external_id, $this->league->external_id, 2026, null, false)
            ->andReturn(new TeamStatistic(['statistics_key' => "{$this->awayTeam->external_id}-{$this->league->external_id}-2026-season"]));
    });

    $this->artisan('app:import-team-statistics')
        ->expectsOutput("Imported {$this->homeTeam->external_id}-{$this->league->external_id}-2026-season")
        ->expectsOutput("Imported {$this->awayTeam->external_id}-{$this->league->external_id}-2026-season")
        ->assertSuccessful();
});
