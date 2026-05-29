<?php

namespace App\Http\Resources;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'logo' => $this->logo_url,
            'foundedAt' => $this->founded_at,
            'country' => $this->country ? [
                'name' => $this->country->name,
                'fifaCode' => $this->country->fifa_code,
                'flag' => $this->country->flag_url,
            ] : null,
            'coach' => $this->coach ? [
                'name' => $this->coach->display_name,
                'firstName' => $this->coach->first_name,
                'lastName' => $this->coach->last_name,
                'birthDate' => $this->coach->birth_date?->format('d M Y'),
                'photo' => $this->coach->photo_url,
                'country' => $this->coach->country?->name,
            ] : null,
            'activePlayers' => $this->players
                ->values()
                ->map(fn (Player $player) => [
                    'id' => $player->id,
                    'name' => $player->display_name,
                    'firstName' => $player->first_name,
                    'lastName' => $player->last_name,
                    'birthDate' => $player->birth_date?->format('d M Y'),
                    'photo' => $player->photo_url,
                    'position' => $player->position,
                    'number' => $player->number,
                    'country' => $player->country?->name,
                ]),
        ];
    }
}
