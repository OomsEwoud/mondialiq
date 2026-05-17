<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FixtureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $prediction = $this->predictionForResponse();
        $aiPrediction = $this->aiPredictionForResponse();
        $userPrediction = $this->userPredictionForResponse();

        return [
            'id'              => $this->id,
            'homeTeamId'      => $this->homeTeam->id,
            'homeTeam'        => $this->homeTeam->name,
            'homeTeamShort'   => $this->homeTeam->code,
            'homeTeamLogo'    => $this->homeTeam->logo_url,
            'awayTeamId'      => $this->awayTeam->id,
            'awayTeam'        => $this->awayTeam->name,
            'awayTeamShort'   => $this->awayTeam->code,
            'awayTeamLogo'    => $this->awayTeam->logo_url,
            'date'            => $this->match_date->format('d M'),
            'dateValue'       => $this->match_date->format('Y-m-d'),
            'time'            => $this->match_date->format('H:i'),
            'round'           => $this->round_name,
            'prediction'      => $prediction ? [
                'homeWin' => $prediction->home_chance,
                'draw'    => $prediction->draw_chance,
                'awayWin' => $prediction->away_chance,
            ] : null,
            'hasAiPrediction' => (bool) $aiPrediction,
            'userPrediction'  => $userPrediction ? [
                'winnerId' => $userPrediction->winner_id,
                'label'    => $this->userPredictionLabel($userPrediction),
            ] : null,
        ];
    }

    private function predictionForResponse()
    {
        if ($this->relationLoaded('aiPrediction')) {
            return $this->aiPrediction;
        }

        if ($this->relationLoaded('userPredictions')) {
            return $this->userPredictions->first();
        }

        return $this->apiPrediction;
    }

    private function aiPredictionForResponse()
    {
        if ($this->relationLoaded('aiPrediction')) {
            return $this->aiPrediction;
        }

        return null;
    }

    private function userPredictionForResponse()
    {
        if ($this->relationLoaded('userPredictions')) {
            return $this->userPredictions->first();
        }

        return null;
    }

    private function userPredictionLabel($prediction): string
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
}
