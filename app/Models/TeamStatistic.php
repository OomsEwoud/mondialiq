<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'team_id',
    'league_id',
    'api_team_id',
    'api_league_id',
    'season',
    'statistics_date',
    'statistics_key',
    'form',
    'fixtures_played_home',
    'fixtures_played_away',
    'fixtures_played_total',
    'wins_home',
    'wins_away',
    'wins_total',
    'draws_home',
    'draws_away',
    'draws_total',
    'losses_home',
    'losses_away',
    'losses_total',
    'goals_for_home',
    'goals_for_away',
    'goals_for_total',
    'goals_for_avg_home',
    'goals_for_avg_away',
    'goals_for_avg_total',
    'goals_against_home',
    'goals_against_away',
    'goals_against_total',
    'goals_against_avg_home',
    'goals_against_avg_away',
    'goals_against_avg_total',
    'clean_sheets_home',
    'clean_sheets_away',
    'clean_sheets_total',
    'failed_to_score_home',
    'failed_to_score_away',
    'failed_to_score_total',
    'biggest_wins_streak',
    'biggest_draws_streak',
    'biggest_losses_streak',
    'most_used_formation',
    'lineups',
    'cards',
    'goals_by_minute',
    'raw_data',
    'fetched_at',
])]
class TeamStatistic extends Model
{
    protected function casts(): array
    {
        return [
            'team_id' => 'integer',
            'league_id' => 'integer',
            'api_team_id' => 'integer',
            'api_league_id' => 'integer',
            'season' => 'integer',
            'statistics_date' => 'date',
            'fixtures_played_home' => 'integer',
            'fixtures_played_away' => 'integer',
            'fixtures_played_total' => 'integer',
            'wins_home' => 'integer',
            'wins_away' => 'integer',
            'wins_total' => 'integer',
            'draws_home' => 'integer',
            'draws_away' => 'integer',
            'draws_total' => 'integer',
            'losses_home' => 'integer',
            'losses_away' => 'integer',
            'losses_total' => 'integer',
            'goals_for_home' => 'integer',
            'goals_for_away' => 'integer',
            'goals_for_total' => 'integer',
            'goals_for_avg_home' => 'float',
            'goals_for_avg_away' => 'float',
            'goals_for_avg_total' => 'float',
            'goals_against_home' => 'integer',
            'goals_against_away' => 'integer',
            'goals_against_total' => 'integer',
            'goals_against_avg_home' => 'float',
            'goals_against_avg_away' => 'float',
            'goals_against_avg_total' => 'float',
            'clean_sheets_home' => 'integer',
            'clean_sheets_away' => 'integer',
            'clean_sheets_total' => 'integer',
            'failed_to_score_home' => 'integer',
            'failed_to_score_away' => 'integer',
            'failed_to_score_total' => 'integer',
            'biggest_wins_streak' => 'integer',
            'biggest_draws_streak' => 'integer',
            'biggest_losses_streak' => 'integer',
            'lineups' => 'array',
            'cards' => 'array',
            'goals_by_minute' => 'array',
            'raw_data' => 'array',
            'fetched_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function formScore(): float
    {
        if (! is_string($this->form) || $this->form === '') {
            return 0.0;
        }

        $results = collect(str_split($this->form));
        $points = $results->sum(function (string $result): int {
            return match ($result) {
                'W' => 3,
                'D' => 1,
                default => 0,
            };
        });

        return round(($points / ($results->count() * 3)) * 100, 2);
    }

    public function recentFormScore(): float
    {
        return $this->formScore();
    }

    public function attackStrength(): float
    {
        return (float) ($this->goals_for_avg_total ?? 0);
    }

    public function defensiveStrength(): float
    {
        $fixturesPlayed = $this->fixtures_played_total ?? 0;

        if ($fixturesPlayed === 0) {
            return 0.0;
        }

        return round(($this->clean_sheets_total / $fixturesPlayed) * 100, 2);
    }
}
