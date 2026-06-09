<?php

use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use App\Services\Player\PlayerStatsService;
use Mockery\MockInterface;

test('the add players command syncs squads for the configured league and season', function () {
    config([
        'services.api_football.league_id' => 1,
        'services.api_football.season' => 2026,
    ]);

    $players = [
        [
            'player' => [
                'id' => 10,
                'name' => 'Test Player',
            ],
        ],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($players) {
        $mock->shouldReceive('getPlayersByLeagueSeason')->once()->with(1, 2026)->andReturn($players);
    });

    $this->mock(PlayerService::class, function (MockInterface $mock) use ($players) {
        $mock->shouldReceive('storePlayers')->once()->with($players);
        $mock->shouldReceive('syncTeamPlayers')->once()->with(1, 2026);
        $mock->shouldReceive('stats')->once()->andReturn([
            'processed' => 0,
            'country_filled' => 0,
            'missing_country' => 0,
        ]);
    });

    $this->mock(PlayerStatsService::class, function (MockInterface $mock) use ($players) {
        $mock->shouldReceive('storePlayerStats')->once()->with($players);
    });

    $this->artisan('app:add-players')
        ->expectsOutput('Ophalen van players')
        ->expectsOutput('Players klaar')
        ->assertSuccessful();
});

test('the add players command still syncs squads when league season players are empty', function () {
    config([
        'services.api_football.league_id' => 1,
        'services.api_football.season' => 2026,
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('getPlayersByLeagueSeason')->once()->with(1, 2026)->andReturn([]);
    });

    $this->mock(PlayerService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('storePlayers');
        $mock->shouldReceive('syncTeamPlayers')->once()->with(1, 2026);
        $mock->shouldReceive('stats')->once()->andReturn([
            'processed' => 0,
            'country_filled' => 0,
            'missing_country' => 0,
        ]);
    });

    $this->mock(PlayerStatsService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('storePlayerStats');
    });

    $this->artisan('app:add-players')
        ->expectsOutput('Ophalen van players')
        ->expectsOutput('Players klaar')
        ->assertSuccessful();
});
