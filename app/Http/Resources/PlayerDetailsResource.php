<?php

namespace App\Http\Resources;

use App\Models\PlayerSeasonStat;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'externalId' => $this->external_id,
            'name' => $this->display_name ?? $this->fullName(),
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'birthDate' => $this->birth_date?->format('d M Y'),
            'age' => $this->birth_date?->age,
            'photo' => $this->photo_url,
            'position' => $this->position,
            'number' => $this->number,
            'country' => $this->countryAttributes(),
            'teams' => $this->teamAttributes(),
            'seasonStats' => $this->seasonStatAttributes(),
        ];
    }

    private function fullName(): string
    {
        $name = trim("{$this->first_name} {$this->last_name}");

        return $name !== '' ? $name : 'Unknown player';
    }

    private function countryAttributes(): ?array
    {
        if (! $this->country) {
            return null;
        }

        return [
            'name' => $this->country->name,
            'fifaCode' => $this->country->fifa_code,
            'flag' => $this->country->flag_url,
        ];
    }

    private function teamAttributes(): array
    {
        return $this->activeTeams
            ->values()
            ->map(fn ($team) => [
                'id' => $team->id,
                'name' => $team->name,
                'code' => $team->code,
                'logo' => $team->logo_url,
                'country' => $team->country?->name,
            ])
            ->all();
    }

    private function seasonStatAttributes(): array
    {
        return $this->playerSeasonStats
            ->values()
            ->map(fn (PlayerSeasonStat $stat) => [
                'id' => $stat->id,
                'league' => $stat->league ? [
                    'id' => $stat->league->id,
                    'name' => $stat->league->name,
                    'logo' => $stat->league->logo_url,
                ] : null,
                'season' => $stat->season,
                'appearances' => $stat->appearances,
                'minutes' => $stat->total_minutes,
                'position' => $stat->position,
                'rating' => $stat->rating,
                'isCaptain' => $stat->is_captain,
                'substitutesIn' => $stat->substitutes_in,
                'substitutesOut' => $stat->substitutes_out,
                'bench' => $stat->bench,
                'totalShots' => $stat->total_shots,
                'shotsOnTarget' => $stat->shots_on_target,
                'goals' => $stat->total_goals,
                'goalsConceded' => $stat->total_goals_conceded,
                'assists' => $stat->total_assists,
                'saves' => $stat->total_saves,
                'totalPasses' => $stat->total_passes,
                'keyPasses' => $stat->key_passes,
                'passAccuracy' => $stat->pass_accuracy,
                'tackles' => $stat->total_tackles,
                'blocks' => $stat->total_blocks,
                'interceptions' => $stat->total_interceptions,
                'totalDuels' => $stat->total_duels,
                'duelsWon' => $stat->duels_won,
                'dribblesAttempts' => $stat->total_dribbles_attempts,
                'dribblesSuccess' => $stat->dribbles_success,
                'dribblesPast' => $stat->dribbles_past,
                'foulsDrawn' => $stat->fouls_drawn,
                'foulsCommitted' => $stat->fouls_committed,
                'yellowCards' => $stat->yellow_cards,
                'yellowRedCards' => $stat->yellow_red_cards,
                'redCards' => $stat->red_cards,
                'penaltiesWon' => $stat->penalties_won,
                'penaltiesCommitted' => $stat->penalties_committed,
                'penaltiesScored' => $stat->penalties_scored,
                'penaltiesMissed' => $stat->penalties_missed,
                'penaltiesSaved' => $stat->penalties_saved,
            ])
            ->all();
    }
}
