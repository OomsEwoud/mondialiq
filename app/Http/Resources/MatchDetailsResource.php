<?php

namespace App\Http\Resources;

use App\Models\FixtureEvent;
use App\Models\FixturePlayer;
use App\Models\Player;
use App\Models\Prediction;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class MatchDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $aiPrediction = $this->aiPredictionForResponse();
        $userPrediction = $this->userPredictionForResponse();

        return [
            'id' => $this->id,
            'homeTeam' => $this->teamAttributes($this->homeTeam),
            'awayTeam' => $this->teamAttributes($this->awayTeam),
            'round' => $this->round_name,
            'season' => $this->season,
            'date' => $this->match_date->format('d M Y'),
            'dateValue' => $this->match_date->format('Y-m-d'),
            'time' => $this->match_date->format('H:i'),
            'status' => $this->status_long,
            'elapsedTime' => $this->elapsed_time,
            'score' => $this->scoreAttributes(),
            'hasAiPrediction' => (bool) $aiPrediction,
            'userPrediction' => $this->userPredictionAttributes($userPrediction),
            'venue' => $this->venueAttributes(),
            'referee' => $this->referee?->name,
            'events' => $this->eventAttributes(),
            'stats' => $this->statAttributes(),
            'lineups' => [
                'home' => $this->lineupForTeam($this->home_team_id),
                'away' => $this->lineupForTeam($this->away_team_id),
            ],
            'availability' => [
                'home' => $this->availabilityForTeam($this->home_team_id),
                'away' => $this->availabilityForTeam($this->away_team_id),
            ],
        ];
    }

    private function teamAttributes(Team $team): array
    {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'code' => $team->code,
            'logo' => $team->logo_url,
        ];
    }

    private function scoreAttributes(): array
    {
        return [
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
        ];
    }

    private function userPredictionAttributes(?Prediction $prediction): ?array
    {
        if (! $prediction) {
            return null;
        }

        return [
            'winnerId' => $prediction->winner_id,
            'outcome' => $this->predictionOutcome($prediction),
            'label' => $this->predictionLabel($prediction),
            'homeScore' => $prediction->home_goals,
            'awayScore' => $prediction->away_goals,
            'confidence' => $prediction->confidence,
            'points' => $prediction->points,
        ];
    }

    private function aiPredictionForResponse(): ?Prediction
    {
        if ($this->relationLoaded('aiPrediction')) {
            return $this->aiPrediction;
        }

        return null;
    }

    private function userPredictionForResponse(): ?Prediction
    {
        if ($this->relationLoaded('userPredictions')) {
            return $this->userPredictions->first();
        }

        return null;
    }

    private function predictionLabel(Prediction $prediction): string
    {
        if (! $prediction->winner_id) {
            return 'Draw';
        }

        if ($prediction->relationLoaded('winner')) {
            return $prediction->winner?->name ?? 'Team pick';
        }

        return match ($prediction->winner_id) {
            $this->home_team_id => $this->homeTeam->name,
            $this->away_team_id => $this->awayTeam->name,
            default => 'Team pick',
        };
    }

    private function predictionOutcome(Prediction $prediction): string
    {
        return match ($prediction->winner_id) {
            $this->home_team_id => 'home',
            $this->away_team_id => 'away',
            default => 'draw',
        };
    }

    private function venueAttributes(): ?array
    {
        if (! $this->venue) {
            return null;
        }

        return [
            'name' => $this->venue->name,
            'city' => $this->venue->city,
            'country' => $this->venue->country?->name,
            'capacity' => $this->venue->capacity,
            'photo' => $this->venue->photo_url,
        ];
    }

    private function eventAttributes(): Collection
    {
        return $this->fixtureEvents
            ->sortBy('time_elapsed')
            ->values()
            ->map(fn (FixtureEvent $event) => [
                'id' => $event->id,
                'minute' => $event->time_elapsed,
                'extraTime' => $event->extra_time,
                'team' => $event->team->name,
                'teamLogo' => $event->team->logo_url,
                'player' => $event->player?->display_name,
                'assist' => $event->assist?->display_name,
                'type' => $event->type,
                'detail' => $event->detail,
            ]);
    }

    private function statAttributes(): Collection
    {
        return $this->fixtureStats
            ->groupBy('name')
            ->map(fn (Collection $stats, string $name) => [
                'name' => $name,
                'home' => $stats->firstWhere('team_id', $this->home_team_id)?->value,
                'away' => $stats->firstWhere('team_id', $this->away_team_id)?->value,
            ])
            ->values();
    }

    private function availabilityForTeam(int $teamId): array
    {
        return $this->missingPlayers
            ->filter(fn (Player $player): bool => $player->teams->contains('id', $teamId))
            ->sortBy(fn (Player $player): string => $this->playerName($player))
            ->values()
            ->map(fn (Player $player) => [
                'id' => $player->id,
                'name' => $this->playerName($player),
                'photo' => $player->photo_url,
                'number' => $player->number,
                'position' => $player->position,
                'country' => $player->country?->name,
                'type' => $player->pivot?->type,
                'reason' => $player->pivot?->reason,
            ])
            ->all();
    }

    private function lineupForTeam(int $teamId): array
    {
        $lineup = $this->lineups->firstWhere('id', $teamId);
        $players = $this->fixturePlayers
            ->where('team_id', $teamId)
            ->values();

        return [
            'formation' => $lineup?->pivot?->formation,
            'starters' => $this->lineupPlayers(
                $this->sortLineupPlayers($players->where('is_starting', true)),
            ),
            'substitutes' => $this->lineupPlayers(
                $this->sortLineupPlayers($players->where('is_starting', false)),
            ),
        ];
    }

    private function lineupPlayers(Collection $players): Collection
    {
        $captainPlayerIds = $this->playerFixtureStats
            ->where('is_captain', true)
            ->pluck('player_id');

        return $players
            ->values()
            ->map(fn (FixturePlayer $fixturePlayer) => [
                'id' => $fixturePlayer->id,
                'playerId' => $fixturePlayer->player_id,
                'name' => $fixturePlayer->player?->display_name ?? 'Unknown player',
                'number' => $fixturePlayer->jersey_number,
                'position' => $fixturePlayer->position,
                'photo' => $fixturePlayer->player?->photo_url,
                'isCaptain' => $captainPlayerIds->contains($fixturePlayer->player_id),
            ]);
    }

    private function sortLineupPlayers(Collection $players): Collection
    {
        return $players
            ->sortBy([
                fn (FixturePlayer $player) => $this->positionSortOrder($player->position),
                fn (FixturePlayer $player) => $player->jersey_number ?? 999,
                fn (FixturePlayer $player) => $player->player?->display_name ?? '',
            ])
            ->values();
    }

    private function positionSortOrder(?string $position): int
    {
        return match ($position) {
            'G' => 10,
            'D' => 20,
            'M' => 30,
            'F' => 40,
            default => 50,
        };
    }

    private function playerName(Player $player): string
    {
        $name = $player->display_name
            ?? trim("{$player->first_name} {$player->last_name}");

        return $name !== '' ? $name : 'Unknown player';
    }
}
