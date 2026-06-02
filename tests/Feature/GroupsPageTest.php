<?php

use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('the groups page exposes group standings and the third placed ranking separately', function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $southKorea = createGroupsPageTeam(701, 'South Korea', 'KOR');

    collect([
        [$southKorea, 3],
        [createGroupsPageTeam(702, 'Belgium', 'BEL'), 1],
        [createGroupsPageTeam(703, 'Canada', 'CAN'), 2],
        [createGroupsPageTeam(704, 'Egypt', 'EGY'), 4],
    ])->each(function (array $teamStanding) use ($league) {
        [$team, $rank] = $teamStanding;

        createGroupsPageStanding($team, $league, 'Group A', $rank);
    });

    collect(range(1, 12))->each(function (int $rank) use ($league, $southKorea) {
        $team = $rank === 1
            ? $southKorea
            : createGroupsPageTeam(800 + $rank, "Third Team {$rank}", "T{$rank}");

        createGroupsPageStanding(
            $team,
            $league,
            'Ranking of third-placed teams',
            $rank,
        );
    });

    $response = $this->get(route('groups'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('groups')
            ->has('groups', 1)
            ->where('groups.0.id', 'A')
            ->has('groups.0.teams', 4)
            ->where('groups.0.teams.2.name', 'South Korea')
            ->where('groups.0.teams.2.rank', 3)
            ->where('thirdPlaceRanking.id', 'BEST_3RD')
            ->where('thirdPlaceRanking.name', 'Best third-placed teams')
            ->has('thirdPlaceRanking.teams', 12)
            ->where('thirdPlaceRanking.teams.0.name', 'South Korea')
            ->where('thirdPlaceRanking.teams.0.rank', 1)
        );
});

function createGroupsPageTeam(int $externalId, string $name, string $code): Team
{
    return Team::create([
        'external_id' => $externalId,
        'name' => $name,
        'code' => $code,
        'logo_url' => "https://example.com/{$code}.png",
    ]);
}

function createGroupsPageStanding(
    Team $team,
    League $league,
    string $groupName,
    int $rank,
): Standing {
    return Standing::create([
        'team_id' => $team->id,
        'league_id' => $league->id,
        'season' => config('services.api_football.season'),
        'group_name' => $groupName,
        'rank' => $rank,
        'points' => 12 - $rank,
        'matches_played' => 3,
        'wins' => max(0, 4 - $rank),
        'draws' => $rank === 3 ? 1 : 0,
        'losses' => max(0, $rank - 2),
        'goals_for' => 6,
        'goals_against' => 3,
        'goal_difference' => 3,
    ]);
}
