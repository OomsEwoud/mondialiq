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
            'home_team' => $this->summarizeTeam(
                $fixture->homeTeam,
                $this->latestStatisticForTeam($fixture, $fixture->home_team_id),
            ),
            'away_team' => $this->summarizeTeam(
                $fixture->awayTeam,
                $this->latestStatisticForTeam($fixture, $fixture->away_team_id),
            ),
        ];
    }

    public function promptBlock(Fixture $fixture): string
    {
        $summary = $this->summarize($fixture);
        $homeTeam = $summary['home_team'];
        $awayTeam = $summary['away_team'];

        return implode(PHP_EOL, [
            'Team statistics summary:',
            '- '.$this->formatFormLine($homeTeam),
            '- '.$this->formatRecordLine($homeTeam),
            '- '.$this->formatFormLine($awayTeam),
            '- '.$this->formatRecordLine($awayTeam),
        ]);
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
            ->where(function (Builder $query) use ($fixture) {
                $query
                    ->whereNull('statistics_date')
                    ->orWhereDate('statistics_date', '<=', $fixture->match_date);
            })
            ->orderByDesc('statistics_date')
            ->orderByDesc('fetched_at')
            ->orderByDesc('id')
            ->first();
    }

    private function summarizeTeam(?Team $team, ?TeamStatistic $statistic): array
    {
        if ($statistic === null) {
            return $this->emptyTeamSummary($team);
        }

        $fixturesPlayed = $statistic->fixtures_played_total;
        $wins = $statistic->wins_total;
        $goalsFor = $statistic->goals_for_total;
        $goalsAgainst = $statistic->goals_against_total;

        return [
            'team_name' => $team?->name,
            'form' => $statistic->form,
            'recent_form_score' => $this->recentFormScore($statistic->form),
            'fixtures_played' => $fixturesPlayed,
            'wins' => $wins,
            'draws' => $statistic->draws_total,
            'losses' => $statistic->losses_total,
            'win_percentage' => $this->percentage($wins, $fixturesPlayed),
            'goals_for' => $goalsFor,
            'goals_against' => $goalsAgainst,
            'goal_difference' => $this->goalDifference($goalsFor, $goalsAgainst),
            'average_goals_for' => $statistic->goals_for_avg_total ?? $this->average($goalsFor, $fixturesPlayed),
            'average_goals_against' => $statistic->goals_against_avg_total ?? $this->average($goalsAgainst, $fixturesPlayed),
        ];
    }

    /**
     * @return array{
     *     team_name: string|null,
     *     form: null,
     *     recent_form_score: null,
     *     fixtures_played: null,
     *     wins: null,
     *     draws: null,
     *     losses: null,
     *     win_percentage: null,
     *     goals_for: null,
     *     goals_against: null,
     *     goal_difference: null,
     *     average_goals_for: null,
     *     average_goals_against: null
     * }
     */
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
