<?php

namespace App\Services\Player;

use App\Models\Player;
use App\Models\Team;
use App\Models\Country;
use App\Services\Country\CountryService;
use Illuminate\Support\Facades\DB;

class PlayerService
{
    private array $countriesCache = [];

    public function __construct(private CountryService $countryService)
    {
    }

    private function loadCountryCache(): void
    {
        if (empty($this->countriesCache)) {
            $this->countriesCache = Country::pluck('id', 'name')->toArray();
        }
    }
    public function storePlayers(array $players): void
    {
        foreach ($players as $player) {
            $this->updateOrCreatePlayer($player['player']);
        }
    }

    public function storeTeamPlayers(int $teamId, array $players): void
    {
        $team = Team::findOrFail($teamId);

        DB::transaction(function () use ($team, $players) {
            $team->players()->update(['is_active' => false]);
            $data = [];

            foreach ($players[0]['players'] as $playerData) {
                $playerModel = $this->updateOrCreatePlayer($playerData);
                $data[$playerModel->id] = ['is_active' => true];
            }

            $team->players()->syncWithoutDetaching($data);
        });
    }

    private function updateOrCreatePlayer(array $data): Player
    {
        $attributes = [];

        if (isset($data['name'])) {
            $attributes['display_name'] = $data['name'];
        }

        if (isset($data['firstname'])) {
            $attributes['first_name'] = $data['firstname'];
        }

        if (isset($data['lastname'])) {
            $attributes['last_name'] = $data['lastname'];
        }

        if (isset($data['position'])) {
            $attributes['position'] = $data['position'];
        }

        if (isset($data['number'])) {
            $attributes['number'] = $data['number'];
        }

        if (isset($data['photo'])) {
            $attributes['photo_url'] = $data['photo'];
        }

        if (isset($data['birth']['date'])) {
            $attributes['birth_date'] = $data['birth']['date'];
        }

        if (isset($data['birth']['country'])) {
            $this->loadCountryCache();
            $apiName = $this->countryService->normalizeName($data['birth']['country']);
            $attributes['country_id'] = $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
        }

        return Player::updateOrCreate(
            ['external_id' => $data['id']],
            $attributes
        );
    }
}
