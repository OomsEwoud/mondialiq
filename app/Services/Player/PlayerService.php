<?php

namespace App\Services\Player;

use App\Models\Player;
use App\Models\Team;
use App\Models\Country;
use Illuminate\Support\Facades\DB;

class PlayerService
{
    public function storePlayers(array $players)
    {
        //with getplayerswithleageuseason functions
        $countries = Country::all()->mapWithKeys(function ($country) {
            return [$this->normalizeName($country->name) => $country->id];
        })->all();

        foreach ($players as $player) {
            $this->updateOrCreatePlayer($player['player'], $countries);
        }
    }

    public function storeTeamPlayers(int $teamId, array $players)
    {
        //with getplayers function
        $team = Team::findOrFail($teamId);

        DB::transaction(function () use ($team, $players) {
            $team->players()->update(['is_active' => false]);

            foreach ($players[0]['players'] as $playerData) {
                $playerModel = $this->updateOrCreatePlayer($playerData);
                $team->players()->syncWithoutDetaching([
                    $playerModel->id => ['is_active' => true]
                ]);
            }
        });
    }

    private function updateOrCreatePlayer(array $data, ?iterable $countries = null): Player
    {
        $attributes = [
            'display_name' => $data['name'],
        ];

        if (isset($data['firstname'])) $attributes['first_name'] = $data['firstname'];
        if (isset($data['lastname']))  $attributes['last_name']  = $data['lastname'];
        if (isset($data['position']))  $attributes['position']   = $data['position'];
        if (isset($data['number']))    $attributes['number']     = $data['number'];
        if (isset($data['photo']))     $attributes['photo_url']  = $data['photo'];

        if (isset($data['birth']['date'])) {
            $attributes['birth_date'] = $data['birth']['date'];
        }

        if ($countries && isset($data['birth']['country'])) {
            $apiName = $this->normalizeName($data['birth']['country']);
            $attributes['country_id'] = $countries[$apiName] ?? null;
        }

        if (!isset($attributes['country_id'])) {
            dump("Land niet gevonden: " . ($data['birth']['country'] ?? 'Onbekend'));
            $attributes['country_id'] = null;
        }

        return Player::updateOrCreate(
            ['external_id' => $data['id']],
            $attributes
        );
    }

    private function normalizeName(?string $name): string
    {
        if (!$name) return '';

        $name = strtolower(trim(str_replace('-', ' ', $name)));
        $map = [
            'korea republic' => 'south korea',
            'republic of korea' => 'south korea',
            'usa' => 'united states',
            'uae' => 'united arab emirates',
            'czechia' => 'czech republic',
            'turkiye' => 'turkey',
        ];

        return $map[$name] ?? $name;
    }
}
