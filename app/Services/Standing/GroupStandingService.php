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
                'id' => $this->groupId($groupName),
                'name' => $this->groupName($groupName),
                'teams' => $this->teams($groupStandings),
            ])
            ->values();
    }

    public function thirdPlaceRanking(Collection $standings): array
    {
        return [
            'id' => 'BEST_3RD',
            'name' => 'Best third-placed teams',
            'teams' => $this->teams($standings),
        ];
    }

    private function groupId(string $groupName): string
    {
        return str($groupName)->afterLast(' ')->upper()->toString();
    }

    private function groupName(string $groupName): string
    {
        return str_starts_with($groupName, 'Group ') ? $groupName : "Group {$groupName}";
    }

    private function teams(Collection $groupStandings): Collection
    {
        return $groupStandings
            ->map(fn (Standing $standing) => $this->teamAttributes($standing))
            ->values();
    }

    private function teamAttributes(Standing $standing): array
    {
        return [
            'id' => $standing->team->id,
            'name' => $standing->team->name,
            'code' => $standing->team->code,
            'logo' => $standing->team->logo_url,
            'rank' => $standing->rank,
            'played' => $standing->matches_played,
            'wins' => $standing->wins,
            'draws' => $standing->draws,
            'losses' => $standing->losses,
            'goalDifference' => $standing->goal_difference,
            'points' => $standing->points,
        ];
    }
}
