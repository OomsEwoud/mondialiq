<?php

use App\Models\Fixture;
use App\Models\HeadToHead;
use App\Models\League;
use App\Models\Team;
use App\Services\HeadToHeadService;
use Mockery\MockInterface;

beforeEach(function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $this->homeTeam = Team::create([
        'external_id' => 901,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $this->awayTeam = Team::create([
        'external_id' => 902,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    $this->otherHomeTeam = Team::create([
        'external_id' => 903,
        'name' => 'Portugal',
        'code' => 'POR',
        'logo_url' => 'https://example.com/portugal.png',
    ]);

    $this->otherAwayTeam = Team::create([
        'external_id' => 904,
        'name' => 'Spain',
        'code' => 'ESP',
        'logo_url' => 'https://example.com/spain.png',
    ]);

    $this->fixture = Fixture::create([
        'external_id' => 3001,
        'league_id' => $league->id,
        'home_team_id' => $this->homeTeam->id,
        'away_team_id' => $this->awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addMinutes(20),
        'status_long' => 'Not Started',
    ]);
});

test('the import head to head command imports a single fixture pair', function () {
    $pairKey = "{$this->homeTeam->id}-{$this->awayTeam->id}";

    $this->mock(HeadToHeadService::class, function (MockInterface $mock) use ($pairKey) {
        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id)
            ->andReturn($pairKey);
        $mock->shouldReceive('hasFreshData')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id)
            ->andReturn(false);
        $mock->shouldReceive('importForTeams')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id, false)
            ->andReturn(new HeadToHead(['pair_key' => $pairKey]));
    });

    $this->artisan("app:import-head-to-head --fixture_id={$this->fixture->id}")
        ->expectsOutput("Geimporteerd {$pairKey}")
        ->assertSuccessful();
});

test('the import head to head command skips fresh data and avoids duplicate pair imports', function () {
    Fixture::create([
        'external_id' => 3002,
        'league_id' => $this->fixture->league_id,
        'home_team_id' => $this->awayTeam->id,
        'away_team_id' => $this->homeTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addMinutes(25),
        'status_long' => 'Not Started',
    ]);

    Fixture::create([
        'external_id' => 3003,
        'league_id' => $this->fixture->league_id,
        'home_team_id' => $this->otherHomeTeam->id,
        'away_team_id' => $this->otherAwayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    $firstPairKey = "{$this->homeTeam->id}-{$this->awayTeam->id}";
    $secondPairKey = "{$this->otherHomeTeam->id}-{$this->otherAwayTeam->id}";

    $this->mock(HeadToHeadService::class, function (MockInterface $mock) use ($firstPairKey, $secondPairKey) {
        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id)
            ->andReturn($firstPairKey);
        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->awayTeam->id, $this->homeTeam->id)
            ->andReturn($firstPairKey);
        $mock->shouldReceive('hasFreshData')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id)
            ->andReturn(true);

        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->otherHomeTeam->id, $this->otherAwayTeam->id)
            ->andReturn($secondPairKey);
        $mock->shouldReceive('hasFreshData')
            ->once()
            ->with($this->otherHomeTeam->id, $this->otherAwayTeam->id)
            ->andReturn(false);
        $mock->shouldReceive('importForTeams')
            ->once()
            ->with($this->otherHomeTeam->id, $this->otherAwayTeam->id, false)
            ->andReturn(new HeadToHead(['pair_key' => $secondPairKey]));
    });

    $this->artisan('app:import-head-to-head')
        ->expectsOutput("Overgeslagen {$firstPairKey}, data is nog recent genoeg.")
        ->expectsOutput("Geimporteerd {$secondPairKey}")
        ->assertSuccessful();
});

test('the import head to head command force option imports all fixture pairs', function () {
    Fixture::create([
        'external_id' => 3004,
        'league_id' => $this->fixture->league_id,
        'home_team_id' => $this->otherHomeTeam->id,
        'away_team_id' => $this->otherAwayTeam->id,
        'round_name' => 'Group Stage - Matchday 4',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addMonth(),
        'status_long' => 'Not Started',
    ]);

    $firstPairKey = "{$this->homeTeam->id}-{$this->awayTeam->id}";
    $secondPairKey = "{$this->otherHomeTeam->id}-{$this->otherAwayTeam->id}";

    $this->mock(HeadToHeadService::class, function (MockInterface $mock) use ($firstPairKey, $secondPairKey) {
        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id)
            ->andReturn($firstPairKey);
        $mock->shouldReceive('importForTeams')
            ->once()
            ->with($this->homeTeam->id, $this->awayTeam->id, true)
            ->andReturn(new HeadToHead(['pair_key' => $firstPairKey]));

        $mock->shouldReceive('makePairKey')
            ->once()
            ->with($this->otherHomeTeam->id, $this->otherAwayTeam->id)
            ->andReturn($secondPairKey);
        $mock->shouldReceive('importForTeams')
            ->once()
            ->with($this->otherHomeTeam->id, $this->otherAwayTeam->id, true)
            ->andReturn(new HeadToHead(['pair_key' => $secondPairKey]));

        $mock->shouldNotReceive('hasFreshData');
    });

    $this->artisan('app:import-head-to-head --force')
        ->expectsOutput("Geimporteerd {$firstPairKey}")
        ->expectsOutput("Geimporteerd {$secondPairKey}")
        ->assertSuccessful();
});
