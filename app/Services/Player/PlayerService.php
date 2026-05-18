<?php

namespace App\Services\Player;

use App\Models\Country;
use App\Models\Player;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;
use Illuminate\Support\Facades\DB;

class PlayerService
{
    protected array $countriesCache = [];

    public function __construct(
        protected CountryService $countryService,
        protected FootballApiService $api,
    ) {
    }

    private function loadCountryCache(): void
    {
        if (empty($this->countriesCache)) {
            $this->countriesCache = Country::query()->pluck('id', 'name')->toArray();
        }
    }

    public function storePlayers(array $players): void
    {
        foreach ($players as $player) {
            $this->updateOrCreatePlayer($player['player']);
        }
    }

    public function storeTeamPlayers(Team $team, array $players): void
    {
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

        $fieldMap = [
            'name'      => 'display_name',
            'firstname' => 'first_name',
            'lastname'  => 'last_name',
            'position'  => 'position',
            'number'    => 'number',
            'photo'     => 'photo_url',
        ];

        foreach ($fieldMap as $apiKey => $dbKey) {
            if (isset($data[$apiKey])) {
                $attributes[$dbKey] = $data[$apiKey];
            }
        }

        if (isset($data['birth']['date'])) {
            $attributes['birth_date'] = $data['birth']['date'];
        }

        if (isset($data['nationality'])) {
            $this->loadCountryCache();
            $apiName = $this->countryService->normalizeName($data['nationality']);
            $attributes['country_id'] = $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
        }

        return Player::query()->updateOrCreate(
            ['external_id' => $data['id']],
            $attributes,
        );
    }

    public function syncTeamPlayers(): void
    {
        Team::query()->chunk(100, function ($teams) {
            foreach ($teams as $team) {
                $teamPlayerData = $this->api->getPlayers($team->external_id);
                $this->storeTeamPlayers($team, $teamPlayerData);
            }
        });
    }
}
