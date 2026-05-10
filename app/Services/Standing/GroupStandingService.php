<?php

namespace App\Services\Standing;

use App\Models\Standing;
use Illuminate\Support\Collection;
class GroupStandingService 
{
    public function groupStandings(Collection $standings): Collection
    {
        return $standings
            ->groupBy('group_name')
            ->map(fn (Collection $groupStandings, string $groupName) => [
                'id'    => $this->groupId($groupName),
                'name'  => str_starts_with($groupName, 'Group ') ? $groupName : "Group {$groupName}",
                'teams' => $groupStandings->map(fn (Standing $standing) => [
                    'id'                      => $standing->team->id,
                    'name'                    => $standing->team->name,
                    'code'                    => $standing->team->code,
                    'logo'                    => $standing->team->logo_url,
                    'rank'                    => $standing->rank,
                    'played'                  => $standing->matches_played,
                    'wins'                    => $standing->wins,
                    'draws'                   => $standing->draws,
                    'losses'                  => $standing->losses,
                    'goalDifference'          => $standing->goal_difference,
                    'points'                  => $standing->points,
                    'qualificationProbability' => $this->qualificationProbability($standing),
                ])->values(),
            ])
            ->values();
    }

    private function groupId(string $groupName): string
    {
        return str($groupName)->afterLast(' ')->upper()->toString();
    }

    private function qualificationProbability(Standing $standing): int
    {
        if ($standing->qualification_chance !== null) {
            return (int) round($standing->qualification_chance);
        }

        $rankBase = match ($standing->rank) {
            1 => 78,
            2 => 66,
            3 => 34,
            default => 8,
        };

        return min(96, max(2, $rankBase + ($standing->points * 2) + $standing->goal_difference));
    }
}