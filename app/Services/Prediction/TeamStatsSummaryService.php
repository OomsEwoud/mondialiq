<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Team;
use App\Models\TeamStatistic;
use Illuminate\Database\Eloquent\Builder;

class TeamStatsSummaryService
{
    public function __construct(
        private readonly PromptFormatter $formatter,
    ) {
    }

    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);

        return [
            'home_team' => $this->summarizeFixtureTeam($fixture, $fixture->homeTeam, $fixture->home_team_id),
            'away_team' => $this->summarizeFixtureTeam($fixture, $fixture->awayTeam, $fixture->away_team_id),
        ];
    }

    public function promptBlock(Fixture $fixture): string
    {
        return implode(PHP_EOL, $this->promptLines($this->summarize($fixture)));
    }

    private function summarizeFixtureTeam(Fixture $fixture, ?Team $team, ?int $teamId): array
    {
        return $this->summarizeTeam(
            $team,
            $this->latestStatisticForTeam($fixture, $teamId),
        );
    }

    private function promptLines(array $summary): array
    {
        return [
            'Team statistics summary:',
            ...$this->teamPromptLines($summary['home_team']),
            ...$this->teamPromptLines($summary['away_team']),
        ];
    }

    private function teamPromptLines(array $teamSummary): array
    {
        return [
            '- '.$this->formatFormLine($teamSummary),
            '- '.$this->formatRecordLine($teamSummary),
        ];
    }

    private function latestStatisticForTeam(Fixture $fixture, ?int $teamId): ?TeamStatistic
    {
        if ($teamId === null) {
            return null;
        }

        return TeamStatistic::query()
            ->where('team_id', $teamId)
            ->where('league_id', $fixture->league_id)
            ->where('season', $fixture->season)
            ->where(fn (Builder $query) => $this->applyStatisticsDateScope($query, $fixture))
            ->orderByDesc('statistics_date')
            ->orderByDesc('fetched_at')
            ->orderByDesc('id')
            ->first();
    }

    private function applyStatisticsDateScope(Builder $query, Fixture $fixture): Builder
    {
        return $query
            ->whereNull('statistics_date')
            ->orWhereDate('statistics_date', '<=', $fixture->match_date);
    }

    private function summarizeTeam(?Team $team, ?TeamStatistic $statistic): array
    {
        if ($statistic === null) {
            return $this->emptyTeamSummary($team);
        }

        return [
            'team_name' => $team?->name,
            'form' => $statistic->form,
            'recent_form_score' => $this->recentFormScore($statistic->form),
            'fixtures_played' => $statistic->fixtures_played_total,
            'wins' => $statistic->wins_total,
            'draws' => $statistic->draws_total,
            'losses' => $statistic->losses_total,
            'win_percentage' => $this->percentage($statistic->wins_total, $statistic->fixtures_played_total),
            'goals_for' => $statistic->goals_for_total,
            'goals_against' => $statistic->goals_against_total,
            'goal_difference' => $this->goalDifference(
                $statistic->goals_for_total,
                $statistic->goals_against_total,
            ),
            'average_goals_for' => $this->averageGoalsFor($statistic),
            'average_goals_against' => $this->averageGoalsAgainst($statistic),
        ];
    }

    private function averageGoalsFor(TeamStatistic $statistic): ?float
    {
        return $statistic->goals_for_avg_total
            ?? $this->average($statistic->goals_for_total, $statistic->fixtures_played_total);
    }

    private function averageGoalsAgainst(TeamStatistic $statistic): ?float
    {
        return $statistic->goals_against_avg_total
            ?? $this->average($statistic->goals_against_total, $statistic->fixtures_played_total);
    }

    private function emptyTeamSummary(?Team $team): array
    {
        return [
            'team_name' => $team?->name,
            'form' => null,
            'recent_form_score' => null,
            'fixtures_played' => null,
            'wins' => null,
            'draws' => null,
            'losses' => null,
            'win_percentage' => null,
            'goals_for' => null,
            'goals_against' => null,
            'goal_difference' => null,
            'average_goals_for' => null,
            'average_goals_against' => null,
        ];
    }

    private function recentFormScore(?string $form): ?int
    {
        if ($form === null || trim($form) === '') {
            return null;
        }

        return collect(str_split(substr($form, -5)))
            ->sum(fn (string $result): int => match ($result) {
                'W' => 3,
                'D' => 1,
                default => 0,
            });
    }

    private function percentage(?int $value, ?int $total): ?float
    {
        if ($value === null || $total === null || $total === 0) {
            return null;
        }

        return round(($value / $total) * 100, 2);
    }

    private function average(?int $value, ?int $total): ?float
    {
        if ($value === null || $total === null || $total === 0) {
            return null;
        }

        return round($value / $total, 2);
    }

    private function goalDifference(?int $goalsFor, ?int $goalsAgainst): ?int
    {
        if ($goalsFor === null || $goalsAgainst === null) {
            return null;
        }

        return $goalsFor - $goalsAgainst;
    }

    private function formatFormLine(array $teamSummary): string
    {
        $teamName = $this->formatter->teamName($teamSummary['team_name']);

        if ($teamSummary['form'] === null) {
            return "{$teamName} form: not available";
        }

        $form = implode('-', str_split(substr($teamSummary['form'], -5)));
        $score = $teamSummary['recent_form_score'];

        return "{$teamName} form: {$form}, recent form score {$score}/15";
    }

    private function formatRecordLine(array $teamSummary): string
    {
        $teamName = $this->formatter->teamName($teamSummary['team_name']);

        if (
            $teamSummary['wins'] === null
            || $teamSummary['draws'] === null
            || $teamSummary['losses'] === null
        ) {
            return "{$teamName} record: not available";
        }

        return "{$teamName} record: {$teamSummary['wins']}W {$teamSummary['draws']}D {$teamSummary['losses']}L";
    }
}
