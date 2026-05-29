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

class PlayerService
{
    private array $countriesCache = [];

    public function __construct(
        private readonly CountryService $countryService,
        private readonly FootballApiService $api,
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
            $playerData = data_get($player, 'player');

            if (is_array($playerData)) {
                $this->updateOrCreatePlayer($playerData);
            }
        }
    }

    public function storeTeamPlayers(Team $team, array $players): void
    {
        $squad = $this->squadPlayers($players);

        if ($squad === []) {
            return;
        }

        DB::transaction(function () use ($team, $squad) {
            $team->players()->update(['is_active' => false]);

            $team->players()->syncWithoutDetaching($this->activeSquadSyncData($squad));
        });
    }

    private function squadPlayers(array $players): array
    {
        $squad = data_get($players, '0.players', []);

        return is_array($squad) ? $squad : [];
    }

    private function activeSquadSyncData(array $squad): array
    {
        $data = [];

        foreach ($squad as $playerData) {
            if (! is_array($playerData)) {
                continue;
            }

            $playerModel = $this->updateOrCreatePlayer($playerData);
            $data[$playerModel->id] = ['is_active' => true];
        }

        return $data;
    }

    private function updateOrCreatePlayer(array $data): Player
    {
        return Player::query()->updateOrCreate(
            $this->playerIdentity($data),
            $this->playerAttributes($data),
        );
    }

    /**
     * @return array{external_id: int}
     */
    private function playerIdentity(array $data): array
    {
        return [
            'external_id' => (int) $data['id'],
        ];
    }

    /**
     * @return array<string, int|string|null>
     */
    private function playerAttributes(array $data): array
    {
        $attributes = $this->mappedPlayerFields($data);

        if (isset($data['birth']['date'])) {
            $attributes['birth_date'] = $data['birth']['date'];
        }

        if (isset($data['nationality']) && is_string($data['nationality'])) {
            $attributes['country_id'] = $this->countryId($data['nationality']);
        }

        return $attributes;
    }

    private function countryId(string $nationality): ?int
    {
        $this->loadCountryCache();

        $apiName = $this->countryService->normalizeName($nationality);

        return $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
    }

    /**
     * @return array<string, int|string|null>
     */
    private function mappedPlayerFields(array $data): array
    {
        $attributes = [];

        foreach ($this->playerFieldMap() as $apiKey => $dbKey) {
            if (isset($data[$apiKey])) {
                $attributes[$dbKey] = $data[$apiKey];
            }
        }

        return $attributes;
    }

    /**
     * @return array<string, string>
     */
    private function playerFieldMap(): array
    {
        return [
            'name' => 'display_name',
            'firstname' => 'first_name',
            'lastname' => 'last_name',
            'position' => 'position',
            'number' => 'number',
            'photo' => 'photo_url',
        ];
    }

    public function syncTeamPlayers(int $leagueId, int $season): void
    {
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
