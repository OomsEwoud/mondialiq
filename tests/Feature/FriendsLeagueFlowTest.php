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
        'icon' => '🏆',
        'accent_color' => 'cyan',
        'cover_style' => 'stadium',
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

test('a user cannot create more than 5 leagues', function () {
    $user = User::factory()->create();

    collect(range(1, 5))->each(function (int $index) use ($user) {
        $league = Scoreboard::create([
            'name' => "League {$index}",
            'code' => sprintf('LIMIT%03d', $index),
        ]);

        $league->users()->attach($user->id);
    });

    $this->actingAs($user)
        ->post(route('leagues.store'), [
            'name' => 'One League Too Many',
        ])
        ->assertSessionHasErrors('name');
});

test('a user cannot join a 6th league', function () {
    $user = User::factory()->create();

    collect(range(1, 5))->each(function (int $index) use ($user) {
        $league = Scoreboard::create([
            'name' => "League {$index}",
            'code' => sprintf('LIMIT%03d', $index),
        ]);

        $league->users()->attach($user->id);
    });

    $league = Scoreboard::create([
        'name' => 'Overflow League',
        'code' => 'OVERFL01',
    ]);

    $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'OVERFL01',
        ])
        ->assertSessionHasErrors('code');

    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league member can view the league detail page with rankings', function () {
    $fixture = createFriendsLeagueFixture();

    $currentUser = User::factory()->create(['name' => 'Current Player']);
    $leader = User::factory()->create(['name' => 'League Captain']);
    $thirdMember = User::factory()->create(['name' => 'Third Member']);

    $league = Scoreboard::create([
        'name' => 'Friends League',
        'icon' => '🔥',
        'accent_color' => 'amber',
        'cover_style' => 'night',
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

    $leaderSecondPrediction = Prediction::create([
        'fixture_id' => Fixture::create([
            'external_id' => 11,
            'league_id' => $fixture->league_id,
            'home_team_id' => $fixture->home_team_id,
            'away_team_id' => $fixture->away_team_id,
            'round_name' => 'Group Stage - Matchday 2',
            'season' => config('services.api_football.season'),
            'match_date' => '2026-06-15 20:00:00',
            'status_long' => 'Finished',
        ])->id,
        'user_id' => $leader->id,
        'source' => PredictionTypes::User->value,
        'points' => 18,
    ]);
    $leaderSecondPrediction->forceFill([
        'updated_at' => now()->subHours(8),
        'created_at' => now()->subHours(8),
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

    $thirdMemberSecondPrediction = Prediction::create([
        'fixture_id' => Fixture::create([
            'external_id' => 12,
            'league_id' => $fixture->league_id,
            'home_team_id' => $fixture->home_team_id,
            'away_team_id' => $fixture->away_team_id,
            'round_name' => 'Group Stage - Matchday 3',
            'season' => config('services.api_football.season'),
            'match_date' => '2026-06-18 20:00:00',
            'status_long' => 'Finished',
        ])->id,
        'user_id' => $thirdMember->id,
        'source' => PredictionTypes::User->value,
        'points' => 0,
    ]);
    $thirdMemberSecondPrediction->forceFill([
        'updated_at' => now()->subHours(10),
        'created_at' => now()->subHours(10),
    ])->saveQuietly();

    $this->actingAs($currentUser)
        ->get(route('leagues.show', $league))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-show')
            ->where('league.name', 'Friends League')
            ->where('league.icon', '🔥')
            ->where('league.accentColor', 'amber')
            ->where('league.coverStyle', 'night')
            ->where('league.code', 'FRIENDS1')
            ->where('league.joinHref', route('leagues.join', ['code' => 'FRIENDS1']))
            ->where('league.settingsHref', null)
            ->where('league.canManage', false)
            ->where('league.canLeave', true)
            ->where('league.membersCount', 3)
            ->where('league.currentLeader', 'League Captain')
            ->where('league.leaderPoints', 48)
            ->where('league.currentUserPoints', 20)
            ->where('league.totalPredictions', 5)
            ->where('league.lastActivityLabel', now()->subHour()->diffForHumans())
            ->where('league.gapToLeader.points', 28)
            ->where('league.gapToLeader.summary', 'You are 28 pts behind League Captain.')
            ->where('league.currentUserRank', 2)
            ->has('league.members', 3)
            ->where('league.members.0.name', 'League Captain')
            ->where('league.members.0.scoringPredictionsCount', 2)
            ->where('league.members.0.lastPredictionLabel', now()->subHours(3)->diffForHumans())
            ->where('league.members.0.gapToAbove', null)
            ->where('league.members.0.form.label', 'Hot streak')
            ->where('league.members.0.isOwner', false)
            ->where('league.members.0.canBeManaged', true)
            ->where('league.members.1.name', 'Current Player')
            ->where('league.members.1.isCurrentUser', true)
            ->where('league.members.1.scoringPredictionsCount', 1)
            ->where('league.members.1.lastPredictionLabel', now()->subHour()->diffForHumans())
            ->where('league.members.1.gapToAbove', 28)
            ->where('league.members.1.form.label', 'Hot streak')
            ->where('league.members.2.scoringPredictionsCount', 1)
            ->where('league.members.2.gapToAbove', 10)
            ->where('league.members.2.form.label', 'Chasing momentum'),
        );
});

test('a league owner can update the league name', function () {
    $owner = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Original League',
        'icon' => '🏆',
        'accent_color' => 'cyan',
        'cover_style' => 'stadium',
        'code' => 'ORIGINL1',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach($owner->id);

    $this->actingAs($owner)
        ->patch(route('leagues.update', $league), [
            'name' => 'Updated League',
            'icon' => '⭐',
            'accent_color' => 'violet',
            'cover_style' => 'spotlight',
        ])
        ->assertRedirect(route('leagues.settings', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League updated.',
        ]);

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
        'name' => 'Updated League',
        'icon' => '⭐',
        'accent_color' => 'violet',
        'cover_style' => 'spotlight',
        'owner_id' => $owner->id,
    ]);
});

test('a league owner sees manage controls on the league detail page', function () {
    $owner = User::factory()->create(['name' => 'Alpha Owner']);
    $member = User::factory()->create(['name' => 'Beta Member']);

    $league = Scoreboard::create([
        'name' => 'Managed League',
        'icon' => '🌍',
        'accent_color' => 'emerald',
        'cover_style' => 'pitch',
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
            ->where('league.icon', '🌍')
            ->where('league.accentColor', 'emerald')
            ->where('league.coverStyle', 'pitch')
            ->where('league.code', 'MANAGED1')
            ->where('league.canManage', true)
            ->where('league.canLeave', false)
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
        'icon' => '🎯',
        'accent_color' => 'rose',
        'cover_style' => 'spotlight',
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
            ->where('league.icon', '🎯')
            ->where('league.accentColor', 'rose')
            ->where('league.coverStyle', 'spotlight')
            ->where('league.code', 'SETTINGS')
            ->where('league.canManage', true)
            ->where('league.settingsHref', route('leagues.settings', $league))
            ->where('league.membersCount', 2)
            ->has('league.members', 2)
            ->where('league.members', fn ($members) => collect($members)->contains(
                fn (array $leagueMember) => $leagueMember['name'] === 'Owner Settings'
                    && $leagueMember['isOwner'] === true
                    && $leagueMember['canBeManaged'] === false
            ))
            ->where('league.members', fn ($members) => collect($members)->contains(
                fn (array $leagueMember) => $leagueMember['name'] === 'Managed Member'
                    && $leagueMember['canBeManaged'] === true
            )),
        );
});

test('a league owner cannot update branding with invalid options', function () {
    $owner = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Validation League',
        'icon' => '🏆',
        'accent_color' => 'cyan',
        'cover_style' => 'stadium',
        'code' => 'VALID001',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach($owner->id);

    $this->actingAs($owner)
        ->patch(route('leagues.update', $league), [
            'name' => 'Validation League',
            'icon' => '💥',
            'accent_color' => 'pink',
            'cover_style' => 'galaxy',
        ])
        ->assertSessionHasErrors(['icon', 'accent_color', 'cover_style']);
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
        ->assertRedirect(route('leagues.settings', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'Invite code refreshed.',
        ]);

    expect($league->fresh()->code)
        ->not->toBe('REFRESH1')
        ->toHaveLength(8);
});

test('a league member can leave a league', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Leavable League',
        'code' => 'LEAVE001',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($member)
        ->delete(route('leagues.leave', $league))
        ->assertRedirect(route('leaderboards'))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'You left Leavable League.',
        ]);

    $this->assertDatabaseMissing('users_has_scoreboards', [
        'user_id' => $member->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league owner cannot leave their own league', function () {
    $owner = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Owner League',
        'code' => 'OWNER001',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach($owner->id);

    $this->actingAs($owner)
        ->delete(route('leagues.leave', $league))
        ->assertSessionHasErrors('league');

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $owner->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league owner can delete their league', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Disposable League',
        'code' => 'DELETE01',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($owner)
        ->delete(route('leagues.destroy', $league))
        ->assertRedirect(route('leaderboards'))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League deleted: Disposable League.',
        ]);

    $this->assertDatabaseMissing('scoreboards', [
        'id' => $league->id,
    ]);
});

test('a non owner cannot delete a league', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Protected Delete League',
        'code' => 'NODELETE',
        'owner_id' => $owner->id,
    ]);

    $league->users()->attach([$owner->id, $member->id]);

    $this->actingAs($member)
        ->delete(route('leagues.destroy', $league))
        ->assertForbidden();

    $this->assertDatabaseHas('scoreboards', [
        'id' => $league->id,
    ]);
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
