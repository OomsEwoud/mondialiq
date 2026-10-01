<?php

use App\Models\User;
use Illuminate\Support\Facades\Event;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('authenticated users cannot start another social login', function (string $routeName) {
    $user = User::factory()->create();
    Socialite::shouldReceive('driver')->never();

    $this->actingAs($user)
        ->get(route($routeName, ['provider' => 'google', 'code' => 'test-code']))
        ->assertRedirect();

    $this->assertAuthenticatedAs($user);
})->with(['auth.redirect', 'auth.callback']);

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
            'socialite' => 'Facebook login was cancelled.',
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
            'socialite' => 'Social login could not be completed. Please try again.',
        ]);

    $this->assertGuest();
});

test('socialite callback signs in an existing account without two factor authentication', function () {
    $user = User::factory()->create();
    $providerUser = (new SocialiteUser)->map([
        'id' => 'google-user-123',
        'name' => $user->name,
        'email' => $user->email,
    ]);
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($providerUser);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->withSession(['url.intended' => route('dashboard')])
        ->get(route('auth.callback', ['provider' => 'google', 'code' => 'test-code']))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->social_provider_id)->toBe('google-user-123');
});

test('socialite login requires the configured second factor before authenticating', function () {
    Event::fake([TwoFactorAuthenticationChallenged::class]);
    $user = User::factory()->create();
    $user->forceFill([
        'two_factor_secret' => encrypt('test-secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code'])),
        'two_factor_confirmed_at' => now(),
    ])->save();
    $providerUser = (new SocialiteUser)->map([
        'id' => 'google-user-123',
        'name' => $user->name,
        'email' => $user->email,
    ]);
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($providerUser);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->withSession(['url.intended' => route('dashboard')])
        ->get(route('auth.callback', ['provider' => 'google', 'code' => 'test-code']))
        ->assertRedirect(route('two-factor.login'))
        ->assertSessionHas('login.id', $user->id)
        ->assertSessionHas('login.remember', false);

    $this->assertGuest();
    Event::assertDispatched(TwoFactorAuthenticationChallenged::class);

    $this->post(route('two-factor.login.store'), ['recovery_code' => 'invalid-code'])
        ->assertSessionHasErrors('recovery_code');
    $this->assertGuest();

    $this->post(route('two-factor.login.store'), ['recovery_code' => 'recovery-code'])
        ->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->recoveryCodes())->not->toContain('recovery-code');
});
