<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Standing;
use App\Models\Team;
use Illuminate\Support\Collection;

class StandingsSummaryService
{
    public function __construct(
        private readonly PromptFormatter $formatter,
    ) {}

    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);
        $standings = $this->standingsForFixture($fixture);

        return [
            'home_team' => $this->summarizeTeam($fixture->homeTeam, $standings->get($fixture->home_team_id)),
            'away_team' => $this->summarizeTeam($fixture->awayTeam, $standings->get($fixture->away_team_id)),
        ];
    }

    public function promptBlock(Fixture $fixture): string
    {
        $lines = $this->promptLines($this->summarize($fixture));

        if ($lines->isEmpty()) {
            return $this->unavailablePromptBlock();
        }

        return implode(PHP_EOL, [
            'Standings summary:',
            ...$lines,
        ]);
    }

    private function standingsForFixture(Fixture $fixture): Collection
    {
        return Standing::query()
            ->where('league_id', $fixture->league_id)
            ->where('season', $fixture->season)
            ->whereIn('team_id', $this->teamIds($fixture))
            ->where('group_name', '!=', 'Ranking of third-placed teams')
            ->get()
            ->keyBy('team_id');
    }

    private function promptLines(array $summary): Collection
    {
        return collect([$summary['home_team'], $summary['away_team']])
            ->filter(fn (array $teamSummary): bool => $teamSummary['rank'] !== null)
            ->map(fn (array $teamSummary): string => $this->formatter->bullet($this->formatTeamLine($teamSummary)))
            ->values();
    }

    private function unavailablePromptBlock(): string
    {
        return implode(PHP_EOL, [
            'Standings summary:',
            '- Standings data not available.',
        ]);
    }

    private function summarizeTeam(?Team $team, ?Standing $standing): array
    {
        if ($standing === null) {
            return $this->emptyTeamSummary($team);
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

    private function teamIds(Fixture $fixture): array
    {
        return array_values(array_filter([
            $fixture->home_team_id,
            $fixture->away_team_id,
        ]));
    }

    private function emptyTeamSummary(?Team $team): array
    {
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

    private function formatTeamLine(array $teamSummary): string
    {
        $teamName = $this->formatter->teamName($teamSummary['team_name']);
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
