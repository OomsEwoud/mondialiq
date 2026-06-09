<?php

namespace App\Services\Player;

use App\Models\Country;
use App\Models\Fixture;
use App\Models\Player;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlayerService
{
    private array $countriesCache = [];

    private int $playersProcessed = 0;

    private int $playersCountryFilled = 0;

    private int $playersMissingCountry = 0;

    private const PLAYER_FIELD_MAP = [
        'name' => 'display_name',
        'firstname' => 'first_name',
        'lastname' => 'last_name',
        'position' => 'position',
        'number' => 'number',
        'photo' => 'photo_url',
    ];

    public function __construct(
        private readonly CountryService $countryService,
        private readonly FootballApiService $api,
    ) {}

    public function resetStats(): void
    {
        $this->playersProcessed = 0;
        $this->playersCountryFilled = 0;
        $this->playersMissingCountry = 0;
    }
    
    public function stats(): array
    {
        return [
            'processed' => $this->playersProcessed,
            'country_filled' => $this->playersCountryFilled,
            'missing_country' => $this->playersMissingCountry,
        ];
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
            $playerData = $this->playerData($player);

            if ($playerData === null) {
                continue;
            }

            $this->updateOrCreatePlayer($playerData);
        }
    }

    public function storeTeamPlayers(Team $team, array $players): void
    {
        $squad = $this->squadPlayers($players);

        if ($squad === []) {
            return;
        }

        DB::transaction(function () use ($team, $squad) {
            DB::table('teams_has_players')
                ->where('team_id', $team->id)
                ->update(['is_active' => false]);

            $team->players()->syncWithoutDetaching($this->activeSquadSyncData($team, $squad));
        });
    }

    private function squadPlayers(array $players): array
    {
        $squad = data_get($players, '0.players', []);

        return is_array($squad) ? $squad : [];
    }

    private function activeSquadSyncData(Team $team, array $squad): array
    {
        $data = [];

        foreach ($squad as $playerData) {
            $playerPayload = $this->playerData($playerData);

            if ($playerPayload === null) {
                continue;
            }

            $playerModel = $this->updateOrCreatePlayer($playerPayload, $team);
            $data[$playerModel->id] = ['is_active' => true];
        }

        return $data;
    }

    private function playerData(mixed $player): ?array
    {
        if (! is_array($player)) {
            return null;
        }

        $playerData = data_get($player, 'player', $player);

        return is_array($playerData) && is_numeric(data_get($playerData, 'id')) ? $playerData : null;
    }

    private function updateOrCreatePlayer(array $data, ?Team $team = null): Player
    {
        if ($team !== null) {
            $this->playersProcessed++;
        }

        $attributes = $this->playerAttributes($data);

        $player = Player::query()->updateOrCreate(
            $this->playerIdentity($data),
            $attributes,
        );

        if ($team !== null && $team->country_id !== null) {
            if ($player->country_id !== $team->country_id) {
                $player->update(['country_id' => $team->country_id]);
                $this->playersCountryFilled++;
            }
        } elseif ($team !== null && $team->country_id === null) {
            $this->playersMissingCountry++;
            Log::warning("Team {$team->name} (id: {$team->id}) heeft geen country_id. Speler kan geen land krijgen.", [
                'player_external_id' => $player->external_id,
                'player_name' => $player->display_name,
            ]);
        }

        return $player;
    }

    private function playerIdentity(array $data): array
    {
        return [
            'external_id' => (int) data_get($data, 'id'),
        ];
    }

    private function playerAttributes(array $data): array
    {
        $attributes = $this->mappedPlayerFields($data);

        $birthDate = data_get($data, 'birth.date');

        if ($birthDate !== null) {
            $attributes['birth_date'] = $birthDate;
        }

        $nationality = data_get($data, 'nationality');

        if (is_string($nationality) && $nationality !== '') {
            $attributes['country_id'] = $this->countryId($nationality);
        }

        return $attributes;
    }

    private function countryId(string $nationality): ?int
    {
        $this->loadCountryCache();

        $apiName = $this->countryService->normalizeName($nationality);

        return $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
    }

    private function mappedPlayerFields(array $data): array
    {
        $attributes = [];

        foreach (self::PLAYER_FIELD_MAP as $apiKey => $dbKey) {
            if (isset($data[$apiKey])) {
                $attributes[$dbKey] = $data[$apiKey];
            }
        }

        return $attributes;
    }

    public function syncTeamPlayers(int $leagueId, int $season): void
    {
        $this->resetStats();

        $teamIds = Fixture::query()
            ->whereHas('league', fn (Builder $query) => $query->where('external_id', $leagueId))
            ->where('season', $season)
            ->get(['home_team_id', 'away_team_id'])
            ->flatMap(fn (Fixture $fixture): array => [$fixture->home_team_id, $fixture->away_team_id])
            ->unique()
            ->values();

        Team::query()
            ->whereIn('id', $teamIds)
            ->whereNotNull('external_id')
            ->chunk(100, function (Collection $teams) {
                foreach ($teams as $team) {
                    $this->syncTeamPlayerSquad($team);
                }
            });
    }

    private function syncTeamPlayerSquad(Team $team): void
    {
        $teamPlayerData = $this->api->getPlayers((int) $team->external_id);

        $this->storeTeamPlayers($team, $teamPlayerData);
    }
}
