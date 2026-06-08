<?php

namespace App\Services\Fixture;

use App\Models\Country;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Referee;
use App\Models\Team;
use App\Models\Venue;
use App\Services\Prediction\UserPredictionScoringService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FixtureService
{
    public function __construct(
        private readonly UserPredictionScoringService $userPredictionScoringService,
    ) {}

    public function storeFixtures(array $fixtures): void
    public function storeFixtures(array $fixtures): array
    {
        $leagueIds = League::query()->pluck('id', 'external_id');
        $stats = ['imported' => 0, 'skipped' => 0, 'lazy_teams_created' => 0];

        foreach ($fixtures as $fixture) {
            $identity = $this->fixtureIdentity($fixture, $leagueIds, $stats);

            if ($identity === null) {
                $stats['skipped']++;

                continue;
            }

            $storedFixture = Fixture::query()->updateOrCreate(
                $this->fixtureUpdateIdentity($identity),
                $this->fixtureAttributes($fixture, $identity),
            );

            $this->scoreUserPredictions($storedFixture);
            $stats['imported']++;
        }

        return $stats;
    }

    private function fixtureIdentity(array $fixture, Collection $leagueIds, array &$stats): ?array
    {
        $externalId = data_get($fixture, 'fixture.id');
        $leagueId = $leagueIds[data_get($fixture, 'league.id')] ?? null;

        $homeTeam = $this->resolveTeamFromPayload(data_get($fixture, 'teams.home'));
        $awayTeam = $this->resolveTeamFromPayload(data_get($fixture, 'teams.away'));

        if (! is_numeric($externalId) || $leagueId === null || $homeTeam === null || $awayTeam === null) {
            return null;
        }

        if ($homeTeam->wasRecentlyCreated) {
            $stats['lazy_teams_created']++;
        }

        if ($awayTeam->wasRecentlyCreated) {
            $stats['lazy_teams_created']++;
        }

        return [
            'external_id' => (int) $externalId,
            'league_id' => (int) $leagueId,
            'home_team_id' => $homeTeam->id,
            'away_team_id' => $awayTeam->id,
        ];
    }

    private function resolveTeamFromPayload(?array $teamData): ?Team
    {
        if (empty($teamData) || empty($teamData['id'])) {
            return null;
        }

        $externalId = (int) $teamData['id'];

        $team = Team::query()->where('external_id', $externalId)->first();

        if ($team) {
            $update = [];

            if (blank($team->name) && filled($teamData['name'])) {
                $update['name'] = $teamData['name'];
            }

            if (blank($team->logo_url) && filled($teamData['logo'])) {
                $update['logo_url'] = $teamData['logo'];
            }

            if (! empty($update)) {
                $team->update($update);
            }

            return $team;
        }

        $attributes = [
            'external_id' => $externalId,
            'name' => $teamData['name'] ?? 'Unknown team',
            'logo_url' => $teamData['logo'] ?? null,
        ];

        if (! empty($teamData['country'])) {
            $country = Country::query()->firstOrCreate(
                ['name' => $teamData['country']],
            );
            $attributes['country_id'] = $country->id;
        }

        return Team::query()->create($attributes);
    }

    private function fixtureUpdateIdentity(array $identity): array
    {
        return [
            'external_id' => $identity['external_id'],
        ];
    }

    private function fixtureAttributes(array $fixture, array $identity): array
    {
        return [
            'league_id' => $identity['league_id'],
            'home_team_id' => $identity['home_team_id'],
            'away_team_id' => $identity['away_team_id'],
            'venue_id' => $this->resolveVenue(data_get($fixture, 'fixture.venue', [])),
            'referee_id' => $this->resolveReferee(data_get($fixture, 'fixture', [])),
            'round_name' => data_get($fixture, 'league.round'),
            'season' => data_get($fixture, 'league.season'),
            'match_date' => Carbon::parse(data_get($fixture, 'fixture.date')),
            'status_short' => data_get($fixture, 'fixture.status.short'),
            'status_long' => data_get($fixture, 'fixture.status.long'),
            'elapsed_time' => data_get($fixture, 'fixture.status.elapsed'),
            ...$this->scoreAttributes($fixture),
            'result' => $this->calculateResult(data_get($fixture, 'score.fulltime', [])),
            'fixture_basics_synced_at' => now('UTC'),
        ];
    }

    private function scoreAttributes(array $fixture): array
    {
        $currentHomeGoals = data_get($fixture, 'goals.home');
        $currentAwayGoals = data_get($fixture, 'goals.away');

        return [
            'halftime_home_goals' => data_get($fixture, 'score.halftime.home'),
            'halftime_away_goals' => data_get($fixture, 'score.halftime.away'),
            'fulltime_home_goals' => data_get($fixture, 'score.fulltime.home')
                ?? $currentHomeGoals,
            'fulltime_away_goals' => data_get($fixture, 'score.fulltime.away')
                ?? $currentAwayGoals,
            'extratime_home_goals' => data_get($fixture, 'score.extratime.home'),
            'extratime_away_goals' => data_get($fixture, 'score.extratime.away'),
            'penalty_home_goals' => data_get($fixture, 'score.penalty.home'),
            'penalty_away_goals' => data_get($fixture, 'score.penalty.away'),
        ];
    }

    private function resolveReferee(array $fixtureData): ?int
    {
        if (empty($fixtureData['referee'])) {
            return null;
        }

        return Referee::query()->firstOrCreate(
            ['name' => $fixtureData['referee']],
        )->id;
    }

    private function resolveVenue(array $venueData): ?int
    {
        if (empty($venueData['name'])) {
            return null;
        }

        $externalId = $this->venueExternalId($venueData);

        $venue = $this->existingVenue($venueData, $externalId);

        if (! $venue) {
            $venue = Venue::query()->create($this->venueAttributes($venueData, $externalId));
        }

        return $venue->id;
    }

    private function existingVenue(array $venueData, ?int $externalId): ?Venue
    {
        if ($externalId !== null) {
            return Venue::query()->where('external_id', $externalId)->first();
        }

        return Venue::query()
            ->where('name', $venueData['name'])
            ->where('city', $venueData['city'] ?? null)
            ->first();
    }

    private function venueAttributes(array $venueData, ?int $externalId): array
    {
        return [
            'external_id' => $externalId,
            'name' => $venueData['name'],
            'city' => $venueData['city'] ?? null,
        ];
    }

    private function venueExternalId(array $venueData): ?int
    {
        $externalId = $venueData['id'] ?? null;

        if (! is_numeric($externalId) || (int) $externalId <= 0) {
            return null;
        }

        return (int) $externalId;
    }

    private function calculateResult(array $fulltime): ?string
    {
        $homeGoals = $fulltime['home'] ?? null;
        $awayGoals = $fulltime['away'] ?? null;

        if ($homeGoals === null || $awayGoals === null) {
            return null;
        }

        if ($homeGoals > $awayGoals) {
            return 'H';
        }

        if ($homeGoals < $awayGoals) {
            return 'A';
        }

        return 'D';
    }

    private function scoreUserPredictions(Fixture $fixture): void
    {
        $this->userPredictionScoringService->scoreFixture($fixture);
    }
}
