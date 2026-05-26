<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\HeadToHead;

class HeadToHeadSummaryService
{
    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing(['homeTeam:id,name', 'awayTeam:id,name']);
        $headToHead = $this->headToHeadForFixture($fixture);

        if ($headToHead === null) {
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

        $homeTeamIsTeamA = $headToHead->team_a_id === $fixture->home_team_id;
        $homeWins = $homeTeamIsTeamA ? $headToHead->team_a_wins : $headToHead->team_b_wins;
        $awayWins = $homeTeamIsTeamA ? $headToHead->team_b_wins : $headToHead->team_a_wins;
        $homeGoals = $homeTeamIsTeamA ? $headToHead->team_a_goals : $headToHead->team_b_goals;
        $awayGoals = $homeTeamIsTeamA ? $headToHead->team_b_goals : $headToHead->team_a_goals;

        return [
            'total_meetings' => $headToHead->total_matches,
            'home_team_h2h_wins' => $homeWins,
            'away_team_h2h_wins' => $awayWins,
            'draws' => $headToHead->draws,
            'home_team_h2h_goals' => $homeGoals,
            'away_team_h2h_goals' => $awayGoals,
            'last_meeting_date' => $headToHead->last_meeting_at?->toDateString(),
            'conclusion' => $this->conclusion($fixture, $homeWins, $awayWins),
        ];
    }

    public function promptBlock(Fixture $fixture): string
    {
        $summary = $this->summarize($fixture);

        if ($summary['total_meetings'] === null) {
            return implode(PHP_EOL, [
                'Head-to-head summary:',
                '- Head-to-head data not available.',
            ]);
        }

        $homeTeamName = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeamName = $fixture->awayTeam?->name ?? 'Away team';

        return implode(PHP_EOL, [
            'Head-to-head summary:',
            '- Total meetings: '.$summary['total_meetings'],
            "- {$homeTeamName} wins: {$summary['home_team_h2h_wins']}",
            "- {$awayTeamName} wins: {$summary['away_team_h2h_wins']}",
            '- Draws: '.$summary['draws'],
            "- Goals: {$homeTeamName} {$summary['home_team_h2h_goals']} - {$summary['away_team_h2h_goals']} {$awayTeamName}",
            '- Last meeting: '.($summary['last_meeting_date'] ?? 'not available'),
        ]);
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

    private function conclusion(Fixture $fixture, int $homeWins, int $awayWins): ?string
    {
        $homeTeamName = $fixture->homeTeam?->name ?? 'Home team';
        $awayTeamName = $fixture->awayTeam?->name ?? 'Away team';

        if ($homeWins > $awayWins) {
            return "{$homeTeamName} has the stronger head-to-head record.";
        }

        if ($awayWins > $homeWins) {
            return "{$awayTeamName} has the stronger head-to-head record.";
        }

        return 'The head-to-head record is balanced.';
    }
}
