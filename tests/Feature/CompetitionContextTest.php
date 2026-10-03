<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Support\Competition\CompetitionContext;

test('the competition context includes every league with fixtures in the configured season', function () {
    $firstLeague = League::create([
        'external_id' => 1001,
        'name' => 'Premier League',
        'type' => 'League',
    ]);
    $secondLeague = League::create([
        'external_id' => 1002,
        'name' => 'Domestic Cup',
        'type' => 'Cup',
    ]);
    $otherSeasonLeague = League::create([
        'external_id' => 1003,
        'name' => 'Older League',
        'type' => 'League',
    ]);
    $homeTeam = Team::create(['name' => 'Home Team', 'logo_url' => 'home.svg']);
    $awayTeam = Team::create(['name' => 'Away Team', 'logo_url' => 'away.svg']);

    foreach ([$firstLeague, $secondLeague] as $index => $league) {
        Fixture::create([
            'external_id' => 2000 + $index,
            'league_id' => $league->id,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
            'round_name' => 'Round 1',
            'season' => config('services.api_football.season'),
            'match_date' => '2026-06-12 20:00:00',
            'status_long' => 'Not Started',
        ]);
    }

    Fixture::create([
        'external_id' => 2003,
        'league_id' => $otherSeasonLeague->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round 1',
        'season' => config('services.api_football.season') - 1,
        'match_date' => '2025-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    expect(app(CompetitionContext::class)->leagueIds())
        ->toEqualCanonicalizing([$firstLeague->id, $secondLeague->id]);
});
