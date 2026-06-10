<?php

use App\Models\Scoreboard;
use App\Models\User;
use App\Support\Leagues\LeagueMembershipLimit;

it('allows a user to join an active public prediction group', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::create([
        'name' => 'Public Group',
        'code' => 'ABCDEFGH',
        'owner_id' => $owner->id,
        'accent_color' => 'blue',
        'icon' => '🏆',
        'visibility' => 'public',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('leagues.join-public', $scoreboard));

    $response->assertRedirect(route('leagues.show', $scoreboard));
    $response->assertSessionHas('inertia.flash_data.toast', [
        'type' => 'success',
        'message' => __('You joined :group.', ['group' => $scoreboard->name]),
    ]);

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $scoreboard->id,
        'role' => 'member',
    ]);
});

it('prevents joining a private group via public endpoint', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::create([
        'name' => 'Private Group',
        'code' => 'ABCDEFGH',
        'owner_id' => $owner->id,
        'accent_color' => 'blue',
        'icon' => '🏆',
        'visibility' => 'private',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('leagues.join-public', $scoreboard));

    $response->assertForbidden();
    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $scoreboard->id,
    ]);
});

it('prevents joining an inactive public group', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::create([
        'name' => 'Inactive Group',
        'code' => 'ABCDEFGH',
        'owner_id' => $owner->id,
        'accent_color' => 'blue',
        'icon' => '🏆',
        'visibility' => 'public',
        'is_active' => false,
    ]);

    $response = $this->actingAs($user)->post(route('leagues.join-public', $scoreboard));

    $response->assertForbidden();
    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $scoreboard->id,
    ]);
});

it('prevents a user from joining the same group twice', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::create([
        'name' => 'Twice Group',
        'code' => 'ABCDEFGH',
        'owner_id' => $owner->id,
        'accent_color' => 'blue',
        'icon' => '🏆',
        'visibility' => 'public',
        'is_active' => true,
    ]);

    $scoreboard->users()->attach($user->id, ['role' => 'member']);

    $response = $this->actingAs($user)->post(route('leagues.join-public', $scoreboard));

    $response->assertRedirect(route('leagues.show', $scoreboard));
    $response->assertSessionHas('inertia.flash_data.toast', [
        'type' => 'info',
        'message' => __('You are already a member of :group.', ['group' => $scoreboard->name]),
    ]);

    $this->assertDatabaseCount('users_has_scoreboards', 1);
});

it('prevents a user from joining if they have reached the maximum group limit', function () {
    $user = User::factory()->create();
    $owner = User::factory()->create();
    $scoreboard = Scoreboard::create([
        'name' => 'Limit Group',
        'code' => 'ABCDEFGH',
        'owner_id' => $owner->id,
        'accent_color' => 'blue',
        'icon' => '🏆',
        'visibility' => 'public',
        'is_active' => true,
    ]);

    for ($i = 0; $i < LeagueMembershipLimit::MAX_LEAGUES_PER_USER; $i++) {
        $existingScoreboard = Scoreboard::create([
            'name' => 'Existing Group ' . $i,
            'code' => 'ABCDEFGH' . $i,
            'owner_id' => $owner->id,
            'accent_color' => 'blue',
            'icon' => '🏆',
            'visibility' => 'private',
            'is_active' => true,
        ]);
        $existingScoreboard->users()->attach($user->id, ['role' => 'member']);
    }

    $response = $this->actingAs($user)->post(route('leagues.join-public', $scoreboard));

    $response->assertRedirect();
    $response->assertSessionHas('inertia.flash_data.toast', [
        'type' => 'error',
        'message' => __('You can only join up to :max prediction groups.', ['max' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER]),
    ]);

    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $scoreboard->id,
    ]);
});
