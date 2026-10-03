<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\FixtureStat;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Models\User;
use Database\Seeders\MondialiQDemoSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('the demo seeder creates a varied football week', function () {
    $user = User::factory()->create();

    $this->seed(MondialiQDemoSeeder::class);

    expect(League::query()->count())->toBe(4)
        ->and(Team::query()->count())->toBe(16)
        ->and(Player::query()->count())->toBe(32)
        ->and(Fixture::query()->count())->toBe(45)
        ->and(Fixture::query()->where('status_short', '2H')->count())->toBe(1)
        ->and(Fixture::query()->where('status_short', 'FT')->count())->toBe(20)
        ->and(Prediction::query()->where('source', PredictionTypes::Ai)->count())->toBe(45)
        ->and(Prediction::query()->get()->every(fn (Prediction $prediction): bool => (float) $prediction->home_chance
            + (float) $prediction->draw_chance
            + (float) $prediction->away_chance === 100.0))->toBeTrue()
        ->and(Prediction::query()->whereNotNull('points_awarded_at')->count())->toBe(20)
        ->and(FixtureEvent::query()->count())->toBe(3)
        ->and(FixtureStat::query()->count())->toBe(168)
        ->and(Standing::query()->count())->toBe(16)
        ->and(TeamStatistic::query()->count())->toBe(16)
        ->and(PlayerSeasonStat::query()->count())->toBe(32)
        ->and(User::query()->where('is_system_user', false)->count())->toBe(1);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('upcomingFixtures', 6)
            ->has('liveFixtures', 1)
            ->has('recentFixtures', 4)
            ->has('competitions', 4));
});

test('the demo seeder can be run repeatedly without creating duplicates', function () {
    $this->seed(MondialiQDemoSeeder::class);
    $this->seed(MondialiQDemoSeeder::class);

    expect(League::query()->count())->toBe(4)
        ->and(Team::query()->count())->toBe(16)
        ->and(Player::query()->count())->toBe(32)
        ->and(Fixture::query()->count())->toBe(45)
        ->and(Prediction::query()->where('source', PredictionTypes::Ai)->count())->toBe(45)
        ->and(FixtureEvent::query()->count())->toBe(3)
        ->and(FixtureStat::query()->count())->toBe(168)
        ->and(Standing::query()->count())->toBe(16)
        ->and(TeamStatistic::query()->count())->toBe(16)
        ->and(PlayerSeasonStat::query()->count())->toBe(32);
});

test('the demo seeder keeps API-synced records separate', function () {
    $apiLeague = League::query()->create([
        'external_id' => 144,
        'name' => 'API League',
        'type' => 'League',
    ]);
    $apiTeam = Team::query()->create([
        'external_id' => 569,
        'name' => 'API Team',
        'logo_url' => 'api-team.svg',
    ]);

    $this->seed(MondialiQDemoSeeder::class);

    expect($apiLeague->refresh()->name)->toBe('API League')
        ->and($apiTeam->refresh()->name)->toBe('API Team')
        ->and(League::query()
            ->whereBetween('external_id', [
                MondialiQDemoSeeder::DEMO_LEAGUE_ID_START,
                MondialiQDemoSeeder::DEMO_LEAGUE_ID_START + 999,
            ])
            ->count())->toBe(4);
});
