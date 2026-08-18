<?php

use App\Models\League;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the dashboard to login', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view their dashboard', function () {
    League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('upcomingFixtures')
            ->has('liveFixtures')
            ->has('recentFixtures')
            ->has('competitions'));
});

test('authenticated users can view an empty dashboard without a configured league', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('upcomingFixtures', 0)
            ->has('recentFixtures', 0)
            ->has('competitions', 0));
});
