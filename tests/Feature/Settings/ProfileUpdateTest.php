<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('edit-account'));

    $response->assertOk();
});

test('profile page receives account specific user fields', function () {
    $user = User::factory()->create([
        'password' => null,
        'social_provider' => 'google',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('edit-account'));

    $accountUser = $response->inertiaProps('accountUser');

    expect($accountUser)->toMatchArray([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'social_provider' => 'google',
        'has_password' => false,
        'is_sso_only' => true,
    ])->toHaveKey('email_verified_at');
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('update-account'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('edit-account'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('update-account'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('edit-account'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('profile avatar can be updated', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('update-account'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('edit-account'));

    $user->refresh();

    expect($user->avatar)->toStartWith('avatars/');
    expect($user->avatar_type)->toBe('upload');

    Storage::disk('public')->assertExists($user->avatar);
});

test('sso only user can update name and avatar without changing email', function () {
    Storage::fake('public');

    $user = User::factory()->create([
        'password' => null,
        'social_provider' => 'google',
        'social_provider_id' => 'google-user-id',
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('update-account'), [
            'name' => 'New Display Name',
            'email' => 'ignored@example.com',
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('edit-account'));

    $user->refresh();

    expect($user->name)->toBe('New Display Name');
    expect($user->email)->not->toBe('ignored@example.com');
    expect($user->avatar)->toStartWith('avatars/');
    expect($user->avatar_type)->toBe('upload');
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('delete-account'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('edit-account'))
        ->delete(route('delete-account'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('edit-account'));

    expect($user->fresh())->not->toBeNull();
});

test('sso only user can delete their account without a password', function () {
    $user = User::factory()->create([
        'password' => null,
        'social_provider' => 'google',
        'social_provider_id' => 'google-user-id',
    ]);

    $response = $this
        ->actingAs($user)
        ->delete(route('delete-account'));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});
