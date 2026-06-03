<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\HeadToHead;

class HeadToHeadSummaryService
{
    public function __construct(
        private readonly PromptFormatter $formatter,
    ) {
    }

    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);
        $headToHead = $this->headToHeadForFixture($fixture);

        if ($headToHead === null) {
            return $this->emptySummary();
        }

        return $this->summaryAttributes($fixture, $headToHead, $this->homeAwaySummary($fixture, $headToHead));
    }

    public function promptBlock(Fixture $fixture): string
    {
        $summary = $this->summarize($fixture);

        if ($summary['total_meetings'] === null) {
            return $this->unavailablePromptBlock();
        }

        return implode(PHP_EOL, $this->promptLines($fixture, $summary));
    }

    private function summaryAttributes(Fixture $fixture, HeadToHead $headToHead, array $homeAwaySummary): array
    {
        return [
            'total_meetings' => $headToHead->total_matches,
            'home_team_h2h_wins' => $homeAwaySummary['home_wins'],
            'away_team_h2h_wins' => $homeAwaySummary['away_wins'],
            'draws' => $headToHead->draws,
            'home_team_h2h_goals' => $homeAwaySummary['home_goals'],
            'away_team_h2h_goals' => $homeAwaySummary['away_goals'],
            'last_meeting_date' => $headToHead->last_meeting_at?->toDateString(),
            'conclusion' => $this->conclusion(
                $fixture,
                $homeAwaySummary['home_wins'],
                $homeAwaySummary['away_wins'],
            ),
        ];
    }

    private function unavailablePromptBlock(): string
    {
        return implode(PHP_EOL, [
            'Head-to-head summary:',
            '- Head-to-head data not available.',
        ]);
    }

    private function promptLines(Fixture $fixture, array $summary): array
    {
        $homeTeamName = $this->formatter->teamName($fixture->homeTeam?->name, 'Home team');
        $awayTeamName = $this->formatter->teamName($fixture->awayTeam?->name, 'Away team');

        return [
            'Head-to-head summary:',
            '- Total meetings: '.$summary['total_meetings'],
            "- {$homeTeamName} wins: {$summary['home_team_h2h_wins']}",
            "- {$awayTeamName} wins: {$summary['away_team_h2h_wins']}",
            '- Draws: '.$summary['draws'],
            "- Goals: {$homeTeamName} {$summary['home_team_h2h_goals']} - {$summary['away_team_h2h_goals']} {$awayTeamName}",
            '- Last meeting: '.$this->formatter->value($summary['last_meeting_date']),
        ];
    }

    private function headToHeadForFixture(Fixture $fixture): ?HeadToHead
    {
        if ($fixture->home_team_id === null || $fixture->away_team_id === null) {
            return null;
        }

        return HeadToHead::query()
            ->where('pair_key', $this->pairKey($fixture->home_team_id, $fixture->away_team_id))
            ->first();
    }

    private function pairKey(int $homeTeamId, int $awayTeamId): string
    {
        return $homeTeamId < $awayTeamId
            ? "{$homeTeamId}-{$awayTeamId}"
            : "{$awayTeamId}-{$homeTeamId}";
    }

    private function emptySummary(): array
    {
        return [
            'total_meetings' => null,
            'home_team_h2h_wins' => null,
            'away_team_h2h_wins' => null,
            'draws' => null,
            'home_team_h2h_goals' => null,
            'away_team_h2h_goals' => null,
            'last_meeting_date' => null,
            'conclusion' => null,
        ];
    }

    private function homeAwaySummary(Fixture $fixture, HeadToHead $headToHead): array
    {
        $homeTeamIsTeamA = $headToHead->team_a_id === $fixture->home_team_id;

        return [
            'home_wins' => $homeTeamIsTeamA ? $headToHead->team_a_wins : $headToHead->team_b_wins,
            'away_wins' => $homeTeamIsTeamA ? $headToHead->team_b_wins : $headToHead->team_a_wins,
            'home_goals' => $homeTeamIsTeamA ? $headToHead->team_a_goals : $headToHead->team_b_goals,
            'away_goals' => $homeTeamIsTeamA ? $headToHead->team_b_goals : $headToHead->team_a_goals,
        ];
    }

    private function conclusion(Fixture $fixture, int $homeWins, int $awayWins): ?string
    {
        $homeTeamName = $this->formatter->teamName($fixture->homeTeam?->name, 'Home team');
        $awayTeamName = $this->formatter->teamName($fixture->awayTeam?->name, 'Away team');

        if ($homeWins > $awayWins) {
            return "{$homeTeamName} has the stronger head-to-head record.";
        }

        if ($awayWins > $homeWins) {
            return "{$awayTeamName} has the stronger head-to-head record.";
        }

        return 'The head-to-head record is balanced.';
    }
}
