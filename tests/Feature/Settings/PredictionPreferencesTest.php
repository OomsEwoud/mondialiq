<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('account settings no longer receives prediction preferences', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('edit-account'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->missing('predictionPreferences'));
});

test('prediction preferences page requires authentication', function () {
    $this->get(route('predictions.preferences'))->assertRedirect(route('login'));
});

test('saved preferences are returned on their new page without changing another user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $other->userPreference();
    $values = [
        'predictions_visibility' => 'private',
        'default_prediction_visibility' => 'private',
        'show_on_leaderboards' => false,
        'allow_group_visibility' => false,
    ];

    $this->actingAs($user)
        ->patch(route('update-prediction-preferences'), $values)
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('predictions.preferences'));

    $this->actingAs($user->fresh())->get(route('predictions.preferences'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions/preferences')
            ->where('predictionPreferences', $values));

    expect($other->fresh()->userPreference()->predictions_visibility)->toBe('public');

    $publicValues = [
        'predictions_visibility' => 'public',
        'default_prediction_visibility' => 'public',
        'show_on_leaderboards' => true,
        'allow_group_visibility' => true,
    ];

    $this->patch(route('update-prediction-preferences'), $publicValues)->assertSessionHasNoErrors();
    $this->get(route('predictions.preferences'))
        ->assertInertia(fn (Assert $page) => $page->where('predictionPreferences', $publicValues));
});

test('prediction preferences page receives default preferences', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('predictions.preferences'));

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
        ->assertRedirect(route('predictions.preferences'));

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
