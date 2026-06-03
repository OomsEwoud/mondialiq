<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Referee;
use App\Models\Team;
use App\Models\Venue;
use App\Services\Prediction\PredictionScoreService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FixtureService
{
    public function __construct(
        private readonly PredictionScoreService $predictionScoreService,
    ) {
    }

    public function storeFixtures(array $fixtures): void
    {
        $leagueIds = League::query()->pluck('id', 'external_id');
        $teamIds = Team::query()->pluck('id', 'external_id');

        foreach ($fixtures as $fixture) {
            $identity = $this->fixtureIdentity($fixture, $leagueIds, $teamIds);

            if ($identity === null) {
                continue;
            }

            $storedFixture = Fixture::query()->updateOrCreate(
                $this->fixtureUpdateIdentity($identity),
                $this->fixtureAttributes($fixture, $identity),
            );

            $this->scoreUserPredictions($storedFixture);
        }
    }

    /**
     * @return array{external_id: int, league_id: int, home_team_id: int, away_team_id: int}|null
     */
    private function fixtureIdentity(array $fixture, Collection $leagueIds, Collection $teamIds): ?array
    {
        $externalId = data_get($fixture, 'fixture.id');
        $leagueId = $leagueIds[data_get($fixture, 'league.id')] ?? null;
        $homeTeamId = $teamIds[data_get($fixture, 'teams.home.id')] ?? null;
        $awayTeamId = $teamIds[data_get($fixture, 'teams.away.id')] ?? null;

        if (! is_numeric($externalId) || $leagueId === null || $homeTeamId === null || $awayTeamId === null) {
            return null;
        }

        return [
            'external_id' => (int) $externalId,
            'league_id' => (int) $leagueId,
            'home_team_id' => (int) $homeTeamId,
            'away_team_id' => (int) $awayTeamId,
        ];
    }

    /**
     * @param  array{external_id: int, league_id: int, home_team_id: int, away_team_id: int}  $identity
     * @return array{external_id: int}
     */
    private function fixtureUpdateIdentity(array $identity): array
    {
        return [
            'external_id' => $identity['external_id'],
        ];
    }

    /**
     * @param  array{external_id: int, league_id: int, home_team_id: int, away_team_id: int}  $identity
     * @return array<string, mixed>
     */
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

    /**
     * @return array{halftime_home_goals: mixed, halftime_away_goals: mixed, fulltime_home_goals: mixed, fulltime_away_goals: mixed, extratime_home_goals: mixed, extratime_away_goals: mixed, penalty_home_goals: mixed, penalty_away_goals: mixed}
     */
    private function scoreAttributes(array $fixture): array
    {
        return [
            'halftime_home_goals' => data_get($fixture, 'score.halftime.home'),
            'halftime_away_goals' => data_get($fixture, 'score.halftime.away'),
            'fulltime_home_goals' => data_get($fixture, 'score.fulltime.home'),
            'fulltime_away_goals' => data_get($fixture, 'score.fulltime.away'),
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

    /**
     * @return array{external_id: int|null, name: mixed, city: mixed}
     */
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
        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return;
        }

        $fixture->userPredictions()
            ->whereNotNull('home_goals')
            ->whereNotNull('away_goals')
            ->get()
            ->each(function (Prediction $prediction) use ($fixture): void {
                $prediction->update([
                    'points' => $this->predictionScoreService->calculate(
                        (int) $prediction->home_goals,
                        (int) $prediction->away_goals,
                        $fixture->fulltime_home_goals,
                        $fixture->fulltime_away_goals,
                    ),
                ]);
            });
    }
}
