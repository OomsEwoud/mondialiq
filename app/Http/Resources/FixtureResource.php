<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FixtureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $prediction = $this->apiPrediction;

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
        ];
    }
}
