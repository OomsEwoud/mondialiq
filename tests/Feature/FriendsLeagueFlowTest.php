<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createFriendsLeagueFixture(): Fixture
{
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    return Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Finished',
    ]);
}

test('an authenticated user can view the create league page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-create'),
        );
});

test('an authenticated user can view the join league page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.join'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-join'),
        );
});

test('the join league page pre-fills the invite code from the query string', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.join', ['code' => 'join2026abc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-join')
            ->where('initialCode', 'JOIN2026'),
        );
});

test('an authenticated user can create a friends league and joins it immediately', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('leagues.store'), [
            'name' => 'MondialIQ Crew',
        ]);

    $league = Scoreboard::query()->first();

    $response
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League created.',
        ]);

    $this->assertDatabaseHas('scoreboards', [
        'name' => 'MondialIQ Crew',
        'owner_id' => $user->id,
    ]);

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league name is required to create a friends league', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('leagues.store'), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');

    expect(Scoreboard::query()->count())->toBe(0);
});

test('an authenticated user can join a friends league with a valid code', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Joinable League',
        'code' => 'JOIN2026',
    ]);

    $response = $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'join2026',
        ]);

    $response
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'You joined Joinable League.',
        ]);

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('an invite code must exist to join a friends league', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'INVALID1',
        ])
        ->assertSessionHasErrors('code');
});

test('a user cannot join the same friends league twice', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Already Joined League',
        'code' => 'ALREADY1',
    ]);

    $league->users()->attach($user->id);

    $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'ALREADY1',
        ])
        ->assertSessionHasErrors('code');
});

test('a league member can view the league detail page with rankings', function () {
    $fixture = createFriendsLeagueFixture();

    $currentUser = User::factory()->create(['name' => 'Current Player']);
    $leader = User::factory()->create(['name' => 'League Captain']);
    $thirdMember = User::factory()->create(['name' => 'Third Member']);

    $league = Scoreboard::create([
        'name' => 'Friends League',
        'code' => 'FRIENDS1',
    ]);

    $league->users()->attach([
        $currentUser->id,
        $leader->id,
        $thirdMember->id,
    ]);

    $leaderPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $leader->id,
        'source' => PredictionTypes::User->value,
        'points' => 30,
    ]);
    $leaderPrediction->forceFill([
        'updated_at' => now()->subHours(3),
        'created_at' => now()->subHours(3),
    ])->saveQuietly();

    $currentUserPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $currentUser->id,
        'source' => PredictionTypes::User->value,
        'points' => 20,
    ]);
    $currentUserPrediction->forceFill([
        'updated_at' => now()->subHour(),
        'created_at' => now()->subHour(),
    ])->saveQuietly();

    $thirdMemberPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $thirdMember->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
    ]);
    $thirdMemberPrediction->forceFill([
        'updated_at' => now()->subHours(5),
        'created_at' => now()->subHours(5),
    ])->saveQuietly();

    $this->actingAs($currentUser)
        ->get(route('leagues.show', $league))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-show')
            ->where('league.name', 'Friends League')
            ->where('league.code', 'FRIENDS1')
            ->where('league.joinHref', route('leagues.join', ['code' => 'FRIENDS1']))
            ->where('league.settingsHref', null)
            ->where('league.canManage', false)
            ->where('league.membersCount', 3)
            ->where('league.currentLeader', 'League Captain')
            ->where('league.leaderPoints', 30)
            ->where('league.currentUserPoints', 20)
            ->where('league.totalPredictions', 3)
            ->where('league.lastActivityLabel', now()->subHour()->diffForHumans())
            ->where('league.gapToLeader.points', 10)
            ->where('league.gapToLeader.summary', 'You are 10 pts behind League Captain.')
            ->where('league.currentUserRank', 2)
            ->has('league.members', 3)
            ->where('league.members.0.name', 'League Captain')
            ->where('league.members.0.isOwner', false)
            ->where('league.members.0.canBeManaged', true)
            ->where('league.members.1.name', 'Current Player')
            ->where('league.members.1.isCurrentUser', true),
        );
});

test('a league owner can update the league name', function () {
    $owner = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Original League',
        'code' => 'ORIGINL1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach($owner->id);

    $this->actingAs($owner)
        ->patch(route('leagues.update', $league), [
            'name' => 'Updated League',
        ])
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League updated.',
        ]);

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'name' => 'Updated League',
        'owner_id' => $owner->id,
    ]);
});

test('a league owner sees manage controls on the league detail page', function () {
    $owner = User::factory()->create(['name' => 'Alpha Owner']);
    $member = User::factory()->create(['name' => 'Beta Member']);

    $league = Scoreboard::create([
        'name' => 'Managed League',
        'code' => 'MANAGED1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->get(route('leagues.show', $league))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-show')
            ->where('league.id', $league->id)
            ->where('league.name', 'Managed League')
            ->where('league.code', 'MANAGED1')
            ->where('league.canManage', true)
            ->where('league.joinHref', route('leagues.join', ['code' => 'MANAGED1']))
            ->where('league.settingsHref', route('leagues.settings', $league))
            ->where('league.membersCount', 2)
            ->where('league.members.0.name', 'Alpha Owner')
            ->where('league.members.0.isOwner', true)
            ->where('league.members.0.canBeManaged', false)
            ->where('league.members.1.name', 'Beta Member')
            ->where('league.members.1.canBeManaged', true),
        );
});

test('a league owner can view the dedicated league settings page', function () {
    $owner = User::factory()->create(['name' => 'Owner Settings']);
    $member = User::factory()->create(['name' => 'Managed Member']);

    $league = Scoreboard::create([
        'name' => 'Settings League',
        'code' => 'SETTINGS',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->get(route('leagues.settings', $league))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-settings')
            ->where('league.id', $league->id)
            ->where('league.name', 'Settings League')
            ->where('league.code', 'SETTINGS')
            ->where('league.canManage', true)
            ->where('league.settingsHref', route('leagues.settings', $league))
            ->where('league.membersCount', 2)
            ->where('league.members.0.name', 'Owner Settings')
            ->where('league.members.0.isOwner', true)
            ->where('league.members.1.name', 'Managed Member')
            ->where('league.members.1.canBeManaged', true),
        );
});

test('a non owner cannot view the dedicated league settings page', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Private Settings League',
        'code' => 'PRIVSET1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($member)
        ->get(route('leagues.settings', $league))
        ->assertForbidden();
});

test('a league owner can refresh the invite code', function () {
    $owner = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Refreshable League',
        'code' => 'REFRESH1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach($owner->id);

    $this->actingAs($owner)
        ->post(route('leagues.refresh-code', $league))
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'Invite code refreshed.',
        ]);

    expect($league->fresh()->code)
        ->not->toBe('REFRESH1')
        ->toHaveLength(8);
});

test('a league owner can remove a member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Removable League',
        'code' => 'REMOVE01',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->delete(route('leagues.members.destroy', [
            'scoreboard' => $league,
            'member' => $member,
        ]))
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'Member removed from the league.',
        ]);

    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $member->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a non owner cannot update the league name', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Locked League',
        'code' => 'LOCKED01',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($member)
        ->patch(route('leagues.update', $league), [
            'name' => 'Hijacked League',
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'name' => 'Locked League',
        'owner_id' => $owner->id,
    ]);
});

test('a non owner cannot refresh the invite code', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Protected League',
        'code' => 'SAFECODE',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($member)
        ->post(route('leagues.refresh-code', $league))
        ->assertForbidden();

    expect($league->fresh()->code)->toBe('SAFECODE');
});

test('a non owner cannot remove a league member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $targetMember = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Protected Members League',
        'code' => 'MEMBERS1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id, $targetMember->id]);

    $this->actingAs($member)
        ->delete(route('leagues.members.destroy', [
            'scoreboard' => $league,
            'member' => $targetMember,
        ]))
        ->assertForbidden();

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $targetMember->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league owner cannot remove themselves', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Owner Protected League',
        'code' => 'SELF0001',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->delete(route('leagues.members.destroy', [
            'scoreboard' => $league,
            'member' => $owner,
        ]))
        ->assertSessionHasErrors('member');

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $owner->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league owner cannot remove a user who is not in the league', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $outsider = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Strict League',
        'code' => 'STRICT01',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->delete(route('leagues.members.destroy', [
            'scoreboard' => $league,
            'member' => $outsider,
        ]))
        ->assertSessionHasErrors('member');

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $member->id,
        'scoreboard_id' => $league->id,
    ]);

    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $outsider->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league owner can transfer ownership to another member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Transfer League',
        'code' => 'TRANSFER',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->post(route('leagues.owner.transfer', [
            'scoreboard' => $league,
            'member' => $member,
        ]))
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League ownership transferred.',
        ]);

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'owner_id' => $member->id,
    ]);
});

test('a non owner cannot transfer league ownership', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $targetMember = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Locked Transfer League',
        'code' => 'LOCKTRNS',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id, $targetMember->id]);

    $this->actingAs($member)
        ->post(route('leagues.owner.transfer', [
            'scoreboard' => $league,
            'member' => $targetMember,
        ]))
        ->assertForbidden();

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'owner_id' => $owner->id,
    ]);
});

test('a league owner cannot transfer ownership to a user outside the league', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $outsider = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Closed Transfer League',
        'code' => 'OUTSIDE01',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->post(route('leagues.owner.transfer', [
            'scoreboard' => $league,
            'member' => $outsider,
        ]))
        ->assertSessionHasErrors('member');

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'owner_id' => $owner->id,
    ]);
});

test('a league owner cannot transfer ownership to themselves', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Same Owner League',
        'code' => 'SELFOWN1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->post(route('leagues.owner.transfer', [
            'scoreboard' => $league,
            'member' => $owner,
        ]))
        ->assertSessionHasErrors('member');

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'owner_id' => $owner->id,
    ]);
});

test('a non member cannot view a private league detail page', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Private League',
        'code' => 'PRIVATE1',
    ]);

    $this->actingAs($user)
        ->get(route('leagues.show', $league))
        ->assertForbidden();
});
