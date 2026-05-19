<?php

use App\Models\Scoreboard;
use App\Models\User;

test('the assign league owners command uses the first league member as owner', function () {
    $firstMember = User::factory()->create();
    $secondMember = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Legacy League',
        'code' => 'LEGACY01',
        'owner_id' => null,
    ]);

    $league->users()->attach($firstMember->id);
    $league->users()->attach($secondMember->id);

    $this->artisan('app:assign-league-owners')
        ->assertSuccessful();

    expect($league->fresh()->owner_id)->toBe($firstMember->id);
});

test('the assign league owners command does not overwrite an existing owner', function () {
    $owner = User::factory()->create();
    $otherMember = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Owned League',
        'code' => 'OWNED001',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $otherMember->id]);

    $this->artisan('app:assign-league-owners')
        ->assertSuccessful();

    expect($league->fresh()->owner_id)->toBe($owner->id);
});
