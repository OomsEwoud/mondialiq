<?php

use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('home', absolute: false));
});

test('registration attempts are rate limited by ip address', function () {
    RateLimiter::clear('register|127.0.0.1');

    foreach (range(1, 3) as $attempt) {
        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => "invalid-{$attempt}",
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertSessionHasErrors('email');
    }

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'blocked@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertTooManyRequests();
});
