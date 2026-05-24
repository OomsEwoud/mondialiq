<?php

use Laravel\Socialite\Socialite;

test('facebook callback with a provider error redirects to login', function () {
    Socialite::shouldReceive('driver')->never();

    $response = $this->get(route('auth.callback', [
        'provider' => 'facebook',
        'error' => 'access_denied',
        'error_code' => '200',
        'error_description' => 'Permissions error',
        'error_reason' => 'user_denied',
        'state' => 'test-state',
    ]));

    $response
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors([
            'socialite' => 'Login met Facebook werd geannuleerd.',
        ]);

    $this->assertGuest();
});

test('socialite callback without an authorization code redirects to login', function () {
    Socialite::shouldReceive('driver')->never();

    $response = $this->get(route('auth.callback', [
        'provider' => 'facebook',
        'state' => 'test-state',
    ]));

    $response
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors([
            'socialite' => 'Social login kon niet worden voltooid. Probeer opnieuw.',
        ]);

    $this->assertGuest();
});
