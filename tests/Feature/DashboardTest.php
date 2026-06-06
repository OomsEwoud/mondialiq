<?php

use App\Models\User;

test('authenticated users can visit the home page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('home'));
    $response->assertOk();
});

test('globally shared auth user only exposes safe fields', function () {
    $user = User::factory()->create([
        'password' => null,
        'social_provider' => 'google',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('home'));

    $sharedUser = $response->inertiaProps('auth.user');

    expect($sharedUser)->toHaveKeys([
        'id',
        'name',
        'email',
        'avatar',
    ])->not->toHaveKeys([
        'email_verified_at',
        'social_provider',
        'avatar_type',
        'created_at',
        'updated_at',
        'has_password',
        'is_sso_only',
    ]);
});
