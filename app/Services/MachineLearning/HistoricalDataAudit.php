<?php

namespace App\Services\MachineLearning;

use App\Models\Fixture;
use App\Services\Football\CompetitionConfig;
use Carbon\CarbonImmutable;

class HistoricalDataAudit
{
    public function inspect(CompetitionConfig $competition): array
    {
        $rows = $competition->constrain(Fixture::query())->with(['homeTeam:id,external_id', 'awayTeam:id,external_id'])
            ->orderBy('match_date')->orderBy('id')->get();
        $issues = [];
        $teams = [];
        $statuses = [];
        $identities = [];
        $slots = [];
        foreach ($rows as $row) {
            $statuses[$row->status_short ?? 'UNKNOWN'] = ($statuses[$row->status_short ?? 'UNKNOWN'] ?? 0) + 1;
            if ($row->external_id === null || isset($identities[$row->external_id])) {
                $issues[] = ['fixture_id' => $row->id, 'issue' => 'missing_or_duplicate_provider_id'];
            }
            $identities[$row->external_id] = true;
            foreach (['homeTeam', 'awayTeam'] as $side) {
                $team = $row->$side;
                if ($team?->external_id === null) {
                    $issues[] = ['fixture_id' => $row->id, 'issue' => 'unknown_team'];
                }
                $id = $team?->id ?? 0;
                $date = $row->getRawOriginal('match_date');
                if (isset($slots[$id.':'.$date])) {
                    $issues[] = ['fixture_id' => $row->id, 'issue' => 'duplicate_team_kickoff'];
                }
                $slots[$id.':'.$date] = true;
                $teams[$id][] = $date;
            }
            if ($row->home_team_id === $row->away_team_id) {
                $issues[] = ['fixture_id' => $row->id, 'issue' => 'identical_teams'];
            }
            foreach ([$row->fulltime_home_goals, $row->fulltime_away_goals] as $score) {
                if (($row->status_short === 'FT' && $score === null) || ($score !== null && ($score < 0 || $score > 20))) {
                    $issues[] = ['fixture_id' => $row->id, 'issue' => 'missing_or_suspicious_score'];
                }
            }
            try {
                $date = CarbonImmutable::parse($row->getRawOriginal('match_date'), 'Europe/Brussels');
                if ($date->year < $competition->season || $date->year > $competition->season + 2 || ($row->status_short === 'FT' && $date->addHours(4)->isFuture())) {
                    $issues[] = ['fixture_id' => $row->id, 'issue' => 'suspicious_kickoff'];
                }
            } catch (\Throwable) {
                $issues[] = ['fixture_id' => $row->id, 'issue' => 'invalid_kickoff'];
            }
        }
        $coverage = [];
        foreach ($teams as $team => $dates) {
            $gaps = [];
            for ($i = 1; $i < count($dates); $i++) {
                $days = CarbonImmutable::parse($dates[$i - 1])->diffInDays(CarbonImmutable::parse($dates[$i]));
                if ($days > 45) {
                    $gaps[] = ['from' => $dates[$i - 1], 'to' => $dates[$i], 'days' => $days];
                }
            }
            $coverage[$team] = ['fixtures' => count($dates), 'first' => $dates[0], 'last' => end($dates), 'possible_gaps' => $gaps];
        }

        return ['league' => $competition->leagueId, 'season' => $competition->season, 'fixtures' => $rows->count(),
            'ft' => $rows->where('status_short', 'FT')->count(), 'first_kickoff' => $rows->first()?->getRawOriginal('match_date'),
            'last_kickoff' => $rows->last()?->getRawOriginal('match_date'), 'storage_timezone' => 'Europe/Brussels',
            'teams' => count($teams), 'team_coverage' => $coverage, 'status_distribution' => $statuses, 'issues' => $issues,
            'season_completeness' => 'unknown_without_trusted_expected_schedule',
            'previous_season_fixtures' => $competition->season > 1900 ? (new CompetitionConfig($competition->leagueId, $competition->season - 1))->constrain(Fixture::query())->count() : 0];
    }
}
