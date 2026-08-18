<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\FixtureEvent;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Standing;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\MondialiQDemoSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('the demo seeder creates a varied football week', function () {
    $this->seed(MondialiQDemoSeeder::class);

    expect(League::query()->count())->toBe(4)
        ->and(Team::query()->count())->toBe(16)
        ->and(Fixture::query()->count())->toBe(45)
        ->and(Fixture::query()->where('status_short', '2H')->count())->toBe(1)
        ->and(Fixture::query()->where('status_short', 'FT')->count())->toBe(20)
        ->and(Prediction::query()->where('source', PredictionTypes::Ai)->count())->toBe(45)
        ->and(Prediction::query()->get()->every(fn (Prediction $prediction): bool => (float) $prediction->home_chance
            + (float) $prediction->draw_chance
            + (float) $prediction->away_chance === 100.0))->toBeTrue()
        ->and(Prediction::query()->whereNotNull('points_awarded_at')->count())->toBe(20)
        ->and(FixtureEvent::query()->count())->toBe(3)
        ->and(Standing::query()->count())->toBe(16)
        ->and(User::query()->where('email', 'ewoud@mondialiq.local')->exists())->toBeTrue();

    $this->actingAs(User::query()->where('email', 'ewoud@mondialiq.local')->firstOrFail())
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
        ->and(Fixture::query()->count())->toBe(45)
        ->and(Prediction::query()->where('source', PredictionTypes::Ai)->count())->toBe(45)
        ->and(FixtureEvent::query()->count())->toBe(3)
        ->and(Standing::query()->count())->toBe(16);
});
