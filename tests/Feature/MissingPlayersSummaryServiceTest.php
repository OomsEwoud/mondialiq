<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\MissingPlayer;
use App\Models\Player;
use App\Models\Team;
use App\Services\Prediction\MissingPlayersSummaryService;

test('it summarizes missing players by team', function () {
    $fixture = createMissingPlayersSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    $homePlayer = createMissingSummaryPlayer('Virgil van Dijk', $fixture->homeTeam);
    $awayPlayerA = createMissingSummaryPlayer('Player A', $fixture->awayTeam);
    $awayPlayerB = createMissingSummaryPlayer('Player B', $fixture->awayTeam);

    createMissingSummaryRow($fixture, $homePlayer, type: 'Missing', reason: 'Injury');
    createMissingSummaryRow($fixture, $awayPlayerA, type: 'Questionable', reason: 'Knock');
    createMissingSummaryRow($fixture, $awayPlayerB, type: 'Doubtful', reason: 'Illness');

    $summary = app(MissingPlayersSummaryService::class)->summarize($fixture);

    expect($summary['home_missing_count'])->toBe(1)
        ->and($summary['away_missing_count'])->toBe(2)
        ->and($summary['home_questionable_count'])->toBe(0)
        ->and($summary['away_questionable_count'])->toBe(2)
        ->and($summary['home_missing_players'])->toBe([
            ['name' => 'Virgil van Dijk', 'type' => 'Missing', 'reason' => 'Injury'],
        ])
        ->and($summary['away_missing_players'])->toBe([
            ['name' => 'Player A', 'type' => 'Questionable', 'reason' => 'Knock'],
            ['name' => 'Player B', 'type' => 'Doubtful', 'reason' => 'Illness'],
        ]);
});

test('it handles no missing players', function () {
    $fixture = createMissingPlayersSummaryFixture();

    $summary = app(MissingPlayersSummaryService::class)->summarize($fixture);

    expect($summary['home_missing_count'])->toBe(0)
        ->and($summary['away_missing_count'])->toBe(0)
        ->and($summary['home_missing_players'])->toBe([])
        ->and($summary['away_missing_players'])->toBe([]);
});

test('it handles missing type and reason values safely', function () {
    $fixture = createMissingPlayersSummaryFixture();
    $player = createMissingSummaryPlayer('Player Without Reason', $fixture->homeTeam);

    createMissingSummaryRow($fixture, $player);

    $summary = app(MissingPlayersSummaryService::class)->summarize($fixture);

    expect($summary['home_missing_count'])->toBe(1)
        ->and($summary['home_questionable_count'])->toBe(0)
        ->and($summary['home_missing_players'])->toBe([
            ['name' => 'Player Without Reason', 'type' => null, 'reason' => null],
        ]);
});

test('it limits long player lists to five players per team', function () {
    $fixture = createMissingPlayersSummaryFixture();

    foreach (range(1, 7) as $number) {
        $player = createMissingSummaryPlayer("Home Player {$number}", $fixture->homeTeam);

        createMissingSummaryRow($fixture, $player);
    }

    $summary = app(MissingPlayersSummaryService::class)->summarize($fixture);

    expect($summary['home_missing_count'])->toBe(7)
        ->and($summary['home_missing_players'])->toHaveCount(5)
        ->and(collect($summary['home_missing_players'])->pluck('name')->all())->toBe([
            'Home Player 1',
            'Home Player 2',
            'Home Player 3',
            'Home Player 4',
            'Home Player 5',
        ]);
});

test('it formats prompt block correctly', function () {
    $fixture = createMissingPlayersSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    $homePlayer = createMissingSummaryPlayer('Virgil van Dijk', $fixture->homeTeam);
    $awayPlayerA = createMissingSummaryPlayer('Player A', $fixture->awayTeam);
    $awayPlayerB = createMissingSummaryPlayer('Player B', $fixture->awayTeam);
    $awayPlayerC = createMissingSummaryPlayer('Player C', $fixture->awayTeam);

    createMissingSummaryRow($fixture, $homePlayer);
    createMissingSummaryRow($fixture, $awayPlayerA);
    createMissingSummaryRow($fixture, $awayPlayerB);
    createMissingSummaryRow($fixture, $awayPlayerC);

    $promptBlock = app(MissingPlayersSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Missing players summary:',
        '- Liverpool: 1 missing player',
        '- Bournemouth: 3 missing players',
        '- Liverpool missing players include: Virgil van Dijk',
        '- Bournemouth missing players include: Player A, Player B, Player C',
    ]));
});

test('it formats prompt block when there are no missing players', function () {
    $fixture = createMissingPlayersSummaryFixture();

    $promptBlock = app(MissingPlayersSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Missing players summary:',
        '- No missing players reported.',
    ]));
});

function createMissingSummaryRow(
    Fixture $fixture,
    Player $player,
    ?string $type = null,
    ?string $reason = null,
): MissingPlayer {
    return MissingPlayer::query()->create([
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => $type,
        'reason' => $reason,
    ]);
}

function createMissingSummaryPlayer(string $name, Team $team): Player
{
    $player = Player::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 999999),
        'display_name' => $name,
    ]);

    $player->teams()->attach($team->id, ['is_active' => true]);

    return $player;
}

function createMissingPlayersSummaryFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => $overrides['league_external_id'] ?? fake()->unique()->numberBetween(1000, 9999),
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => $overrides['home_team_external_id'] ?? fake()->unique()->numberBetween(10000, 19999),
        'name' => $overrides['home_team_name'] ?? 'Home Team',
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => $overrides['away_team_external_id'] ?? fake()->unique()->numberBetween(20000, 29999),
        'name' => $overrides['away_team_name'] ?? 'Away Team',
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    return Fixture::query()->create([
        'external_id' => $overrides['external_id'] ?? fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Matchday 1',
        'season' => $overrides['season'] ?? config('services.api_football.season'),
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);
}
