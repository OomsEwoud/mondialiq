<?php

namespace App\Http\Resources;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

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
            'country' => $this->countryAttributes(),
            'coach' => $this->coachAttributes(),
            'activePlayers' => $this->activePlayerAttributes(),
        ];
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

    private function coachAttributes(): ?array
    {
        if (! $this->coach) {
            return null;
        }

        return [
            'name' => $this->coach->display_name,
            'firstName' => $this->coach->first_name,
            'lastName' => $this->coach->last_name,
            'birthDate' => $this->coach->birth_date?->format('d M Y'),
            'photo' => $this->coach->photo_url,
            'country' => $this->coach->country?->name,
        ];
    }

    private function activePlayerAttributes(): Collection
    {
        return $this->activePlayers
            ->values()
            ->map(fn (Player $player) => $this->playerAttributes($player));
    }

    private function playerAttributes(Player $player): array
    {
        return [
            'id' => $player->id,
            'name' => $player->display_name,
            'firstName' => $player->first_name,
            'lastName' => $player->last_name,
            'birthDate' => $player->birth_date?->format('d M Y'),
            'photo' => $player->photo_url,
            'position' => $player->position,
            'number' => $player->number,
            'country' => $player->country?->name,
        ];
    }
}
