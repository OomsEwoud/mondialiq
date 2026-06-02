<?php

namespace App\Services\Standing;

use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use Illuminate\Support\Collection;

class StandingService
{
    public function storeStandings(array $standingsData): void
    {
        $leagueData = $this->leagueData($standingsData);
        $league = $this->league($leagueData);

        if ($league === null || $leagueData === []) {
            return;
        }

        $teams = $this->teamIdsByExternalId();
        $season = (int) data_get($leagueData, 'season');

        foreach ($this->standingRows($leagueData) as $standing) {
            $teamId = $this->teamId($standing, $teams);

            if ($teamId === null) {
                continue;
            }

            $groupName = (string) data_get($standing, 'group', '');

            Standing::query()->updateOrCreate(
                $this->standingIdentity($teamId, $league->id, $season, $groupName),
                $this->standingAttributes($standing, $groupName),
            );
        }
    }

    private function leagueData(array $standingsData): array
    {
        $leagueData = data_get($standingsData, '0.league', []);

        return is_array($leagueData) ? $leagueData : [];
    }

    private function league(array $leagueData): ?League
    {
        $leagueName = data_get($leagueData, 'name');

        if (! is_string($leagueName) || $leagueName === '') {
            return null;
        }

        return League::query()
            ->where('name', $leagueName)
            ->first();
    }

    private function teamIdsByExternalId(): Collection
    {
        return Team::query()->pluck('id', 'external_id');
    }

    private function standingRows(array $leagueData): Collection
    {
        return collect(data_get($leagueData, 'standings', []))
            ->filter(fn (mixed $group): bool => is_array($group))
            ->flatMap(fn (array $group): array => $group)
            ->filter(fn (mixed $standing): bool => is_array($standing))
            ->values();
    }

    private function teamId(array $standing, Collection $teams): ?int
    {
        $externalTeamId = data_get($standing, 'team.id');

        if (! is_numeric($externalTeamId)) {
            return null;
        }

        return $teams[(int) $externalTeamId] ?? null;
    }

    /**
     * @return array{team_id: int, league_id: int, season: int, group_name: string}
     */
    private function standingIdentity(int $teamId, int $leagueId, int $season, string $groupName): array
    {
        return [
            'team_id' => $teamId,
            'league_id' => $leagueId,
            'season' => $season,
            'group_name' => $groupName,
        ];
    }

    /**
     * @return array{
     *     group_name: string,
     *     rank: int,
     *     points: int,
     *     matches_played: int,
     *     wins: int,
     *     draws: int,
     *     losses: int,
     *     goals_for: int,
     *     goals_against: int,
     *     goal_difference: int,
     *     form: string|null
     * }
     */
    private function standingAttributes(array $standing, string $groupName): array
    {
        return [
            'group_name' => $groupName,
            'rank' => (int) data_get($standing, 'rank', 0),
            'points' => (int) data_get($standing, 'points', 0),
            'matches_played' => (int) data_get($standing, 'all.played', 0),
            'wins' => (int) data_get($standing, 'all.win', 0),
            'draws' => (int) data_get($standing, 'all.draw', 0),
            'losses' => (int) data_get($standing, 'all.lose', 0),
            'goals_for' => (int) data_get($standing, 'all.goals.for', 0),
            'goals_against' => (int) data_get($standing, 'all.goals.against', 0),
            'goal_difference' => (int) data_get($standing, 'goalsDiff', 0),
            'form' => $this->nullableString(data_get($standing, 'form')),
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
