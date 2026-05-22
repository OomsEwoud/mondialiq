<?php

use App\Services\Apis\FootballApiService;
use App\Services\Fixture\MissingPlayerService;
use Mockery\MockInterface;

test('the add missing players command succeeds with an empty api response', function () {
    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('getInjuries')
            ->once()
            ->with(
                config('services.api_football.league_id'),
                config('services.api_football.season'),
            )
            ->andReturn([]);
    });

    $this->mock(MissingPlayerService::class, function (MockInterface $mock) {
        $mock->shouldReceive('storeMissingPlayers')
            ->once()
            ->with([])
            ->andReturn([
                'processed' => 0,
                'created' => 0,
                'updated' => 0,
                'skipped' => 0,
            ]);
    });

    $this->artisan('app:add-missing-players')
        ->expectsOutput('Ophalen van ontbrekende spelers')
        ->expectsOutput('Geen ontbrekende spelers ontvangen van de API.')
        ->assertSuccessful();
});
