<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class MatchDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'homeTeam' => [
                'id' => $this->homeTeam->id,
                'name' => $this->homeTeam->name,
                'code' => $this->homeTeam->code,
                'logo' => $this->homeTeam->logo_url,
            ],
            'awayTeam' => [
                'id' => $this->awayTeam->id,
                'name' => $this->awayTeam->name,
                'code' => $this->awayTeam->code,
                'logo' => $this->awayTeam->logo_url,
            ],
            'round' => $this->round_name,
            'season' => $this->season,
            'date' => $this->match_date->format('d M Y'),
            'time' => $this->match_date->format('H:i'),
            'status' => $this->status_long,
            'elapsedTime' => $this->elapsed_time,
            'score' => [
                'halftime' => [
                    'home' => $this->halftime_home_goals,
                    'away' => $this->halftime_away_goals,
                ],
                'fulltime' => [
                    'home' => $this->fulltime_home_goals,
                    'away' => $this->fulltime_away_goals,
                ],
                'extratime' => [
                    'home' => $this->extratime_home_goals,
                    'away' => $this->extratime_away_goals,
                ],
                'penalties' => [
                    'home' => $this->penalty_home_goals,
                    'away' => $this->penalty_away_goals,
                ],
            ],
            'venue' => $this->venue ? [
                'name' => $this->venue->name,
                'city' => $this->venue->city,
                'country' => $this->venue->country?->name,
                'capacity' => $this->venue->capacity,
                'photo' => $this->venue->photo_url,
            ] : null,
            'referee' => $this->referee?->name,
            'events' => $this->fixtureEvents
                ->sortBy('time_elapsed')
                ->values()
                ->map(fn ($event) => [
                    'id' => $event->id,
                    'minute' => $event->time_elapsed,
                    'extraTime' => $event->extra_time,
                    'team' => $event->team->name,
                    'teamLogo' => $event->team->logo_url,
                    'player' => $event->player?->display_name,
                    'assist' => $event->assist?->display_name,
                    'type' => $event->type,
                    'detail' => $event->detail,
                ]),
            'stats' => $this->fixtureStats
                ->groupBy('name')
                ->map(fn (Collection $stats, string $name) => [
                    'name' => $name,
                    'home' => $stats->firstWhere('team_id', $this->home_team_id)?->value,
                    'away' => $stats->firstWhere('team_id', $this->away_team_id)?->value,
                ])
                ->values(),
            'lineups' => [
                'home' => $this->lineupForTeam($this->home_team_id),
                'away' => $this->lineupForTeam($this->away_team_id),
            ],
        ];
    }

    private function lineupForTeam(int $teamId): array
    {
        $lineup = $this->lineups->firstWhere('id', $teamId);
        $players = $this->fixturePlayers
            ->where('team_id', $teamId)
            ->sortBy([
                ['is_starting', 'desc'],
                ['jersey_number', 'asc'],
                ['player.display_name', 'asc'],
            ])
            ->values();

        return [
            'formation' => $lineup?->pivot?->formation,
            'starters' => $this->lineupPlayers($players->where('is_starting', true)),
            'substitutes' => $this->lineupPlayers($players->where('is_starting', false)),
        ];
    }

    private function lineupPlayers(Collection $players): Collection
    {
        return $players
            ->values()
            ->map(fn ($fixturePlayer) => [
                'id' => $fixturePlayer->id,
                'playerId' => $fixturePlayer->player_id,
                'name' => $fixturePlayer->player?->display_name ?? 'Unknown player',
                'number' => $fixturePlayer->jersey_number,
                'position' => $fixturePlayer->position,
            ]);
    }
}
