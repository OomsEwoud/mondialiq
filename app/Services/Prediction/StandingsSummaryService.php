<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Standing;
use App\Models\Team;

class StandingsSummaryService
{
    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);
        $standings = Standing::query()
            ->where('league_id', $fixture->league_id)
            ->where('season', $fixture->season)
            ->whereIn('team_id', array_filter([$fixture->home_team_id, $fixture->away_team_id]))
            ->get()
            ->keyBy('team_id');

        return [
            'home_team' => $this->summarizeTeam($fixture->homeTeam, $standings->get($fixture->home_team_id)),
            'away_team' => $this->summarizeTeam($fixture->awayTeam, $standings->get($fixture->away_team_id)),
        ];
    }

    public function promptBlock(Fixture $fixture): string
    {
        $summary = $this->summarize($fixture);
        $lines = collect([$summary['home_team'], $summary['away_team']])
            ->filter(fn (array $teamSummary): bool => $teamSummary['rank'] !== null)
            ->map(fn (array $teamSummary): string => '- '.$this->formatTeamLine($teamSummary))
            ->values();

        if ($lines->isEmpty()) {
            return implode(PHP_EOL, [
                'Standings summary:',
                '- Standings data not available.',
            ]);
        }

        return implode(PHP_EOL, [
            'Standings summary:',
            ...$lines,
        ]);
    }

    private function summarizeTeam(?Team $team, ?Standing $standing): array
    {
        if ($standing === null) {
            return [
                'team_name' => $team?->name,
                'rank' => null,
                'points' => null,
                'played' => null,
                'wins' => null,
                'draws' => null,
                'losses' => null,
                'goals_for' => null,
                'goals_against' => null,
                'goal_difference' => null,
                'group_name' => null,
            ];
        }

        return [
            'team_name' => $team?->name,
            'rank' => $standing->rank,
            'points' => $standing->points,
            'played' => $standing->matches_played,
            'wins' => $standing->wins,
            'draws' => $standing->draws,
            'losses' => $standing->losses,
            'goals_for' => $standing->goals_for,
            'goals_against' => $standing->goals_against,
            'goal_difference' => $standing->goal_difference,
            'group_name' => $standing->group_name,
        ];
    }

    private function formatTeamLine(array $teamSummary): string
    {
        $teamName = $teamSummary['team_name'] ?? 'Unknown team';
        $rank = $this->ordinal($teamSummary['rank']);
        $goalDifference = $this->formatGoalDifference($teamSummary['goal_difference']);

        return "{$teamName}: {$rank}, {$teamSummary['points']} points, {$goalDifference} goal difference";
    }

    private function ordinal(int $number): string
    {
        if (in_array($number % 100, [11, 12, 13], true)) {
            return "{$number}th";
        }

        return match ($number % 10) {
            1 => "{$number}st",
            2 => "{$number}nd",
            3 => "{$number}rd",
            default => "{$number}th",
        };
    }

    private function formatGoalDifference(int $goalDifference): string
    {
        if ($goalDifference > 0) {
            return "+{$goalDifference}";
        }

        return (string) $goalDifference;
    }
}
