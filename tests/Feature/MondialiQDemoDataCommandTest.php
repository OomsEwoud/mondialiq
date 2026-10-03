<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\User;

test('the demo data command populates repeatable football data without a human user', function () {
    $this->artisan('mondialiq:demo-data')
        ->expectsOutputToContain('Demo data created successfully.')
        ->assertSuccessful();

    expect(League::query()->count())->toBe(4)
        ->and(Fixture::query()->count())->toBe(45)
        ->and(Prediction::query()->where('source', PredictionTypes::Ai)->count())->toBe(45)
        ->and(User::query()->where('is_system_user', false)->count())->toBe(0);
});

test('the demo data command can add predictions for a selected human user idempotently', function () {
    $user = User::factory()->create();

    $this->artisan('mondialiq:demo-data', ['--user' => $user->email])
        ->assertSuccessful();

    $predictionCount = Prediction::query()
        ->whereBelongsTo($user)
        ->where('source', PredictionTypes::User)
        ->count();

    expect($predictionCount)->toBe(6);

    $this->artisan('mondialiq:demo-data', ['--user' => (string) $user->id])
        ->assertSuccessful();

    expect(Prediction::query()
        ->whereBelongsTo($user)
        ->where('source', PredictionTypes::User)
        ->count())->toBe($predictionCount);
});

test('the demo data command rejects an unknown user before seeding', function () {
    $this->artisan('mondialiq:demo-data', ['--user' => 'missing@example.test'])
        ->assertExitCode(1);

    expect(League::query()->count())->toBe(0);
});

test('the demo data command refuses to run in production', function () {
    $this->app['env'] = 'production';

    $this->artisan('mondialiq:demo-data')
        ->assertExitCode(1);

    expect(League::query()->count())->toBe(0);
});

test('the demo data command does not promote a human account to the reserved AI account', function () {
    $human = User::factory()->create(['email' => 'ai@mondialiq.local']);

    $this->artisan('mondialiq:demo-data')
        ->assertExitCode(1);

    expect($human->fresh()->is_system_user)->toBeFalse()
        ->and(League::query()->count())->toBe(0);
});
