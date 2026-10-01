<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('application pages require authentication before returning data', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));
    $this->getJson($uri)->assertUnauthorized();
})->with([
    '/dashboard', '/matches', '/matches/1', '/teams/1', '/players/1',
    '/groups', '/predictions', '/predictions?mode=mine', '/ai/predictions',
    '/leaderboards', '/leagues/create', '/leagues/join', '/leagues/1',
    '/leagues/1/settings', '/leagues/1/members', '/leagues/1/predict',
    '/leagues/1/members/1/predictions', '/predictions/1/ai',
    '/predictions/1/my-prediction', '/predictions/1/user/1',
    '/users/1/predictions', '/settings', '/settings/profile',
]);

test('public entry and information pages remain accessible', function (string $uri) {
    $this->get($uri)->assertSuccessful();
})->with(['/', '/login', '/register', '/forgot-password', '/privacy', '/contact', '/how-it-works', '/scoring']);

test('guest home props do not expose protected fixture data', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('upcomingFixtures', 0)
        ->has('liveFixtures', 0));
});

test('live fixtures reject guests and support authenticated browser sessions', function () {
    $this->getJson(route('api.live-fixtures'))->assertUnauthorized();

    $user = User::factory()->create();
    $this->withSession([auth()->guard('web')->getName() => $user->id])
        ->getJson(route('api.live-fixtures'))
        ->assertSuccessful()
        ->assertJsonStructure(['data']);
});

test('login returns the user to the requested protected page', function () {
    $user = User::factory()->create();

    $this->get('/predictions?mode=mine')->assertRedirect(route('login'));
    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/predictions?mode=mine');

    $this->assertAuthenticatedAs($user);
});
