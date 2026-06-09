<?php

use App\Models\User;

test('prediction preferences page receives default preferences', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('edit-account'));

    $response->assertOk();

    $preferences = $response->inertiaProps('predictionPreferences');

    expect($preferences)->toMatchArray([
        'predictions_visibility' => 'public',
        'default_prediction_visibility' => 'public',
        'show_on_leaderboards' => true,
        'allow_group_visibility' => true,
    ]);
});

test('prediction preferences can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('update-prediction-preferences'), [
            'predictions_visibility' => 'private',
            'default_prediction_visibility' => 'private',
            'show_on_leaderboards' => false,
            'allow_group_visibility' => false,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('edit-account'));

    $user->refresh();
    $preference = $user->userPreference();

    expect($preference->predictions_visibility)->toBe('private');
    expect($preference->default_prediction_visibility)->toBe('private');
    expect($preference->show_on_leaderboards)->toBeFalse();
    expect($preference->allow_group_visibility)->toBeFalse();
});

test('prediction preferences update validates visibility values', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('update-prediction-preferences'), [
            'predictions_visibility' => 'invalid',
            'default_prediction_visibility' => 'invalid',
            'show_on_leaderboards' => 'not-a-boolean',
            'allow_group_visibility' => 'not-a-boolean',
        ]);

    $response->assertSessionHasErrors([
        'predictions_visibility',
        'default_prediction_visibility',
        'show_on_leaderboards',
        'allow_group_visibility',
    ]);
});

test('unauthenticated user cannot access prediction preferences route', function () {
    $response = $this->patch(route('update-prediction-preferences'), [
        'predictions_visibility' => 'private',
        'default_prediction_visibility' => 'private',
        'show_on_leaderboards' => false,
        'allow_group_visibility' => false,
    ]);

    $response->assertRedirect(route('login'));
});

test('prediction preferences update creates record if none exists', function () {
    $user = User::factory()->create();

    expect($user->preference)->toBeNull();

    $this
        ->actingAs($user)
        ->patch(route('update-prediction-preferences'), [
            'predictions_visibility' => 'public',
            'default_prediction_visibility' => 'public',
            'show_on_leaderboards' => true,
            'allow_group_visibility' => true,
        ]);

    $user->refresh();

    expect($user->preference)->not->toBeNull();
    expect($user->preference->predictions_visibility)->toBe('public');
});
