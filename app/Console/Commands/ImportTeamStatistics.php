<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Models\Fixture;
use App\Models\League;
use App\Services\TeamStatisticsService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:import-team-statistics
    {--team_id=}
    {--league_id=}
    {--season=}
    {--date=}
    {--force}')]
#[Description('Importeer team statistics uit de Football API')]
class ImportTeamStatistics extends Command
{
    use InteractsWithFootballApiConfig;

    public function __construct(
        protected TeamStatisticsService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $teamId = $this->option('team_id');
        $leagueId = $this->option('league_id');
        $season = $this->option('season');
        $date = $this->option('date');
        $force = (bool) $this->option('force');

        if ($teamId !== null || $leagueId !== null || $season !== null) {
            if ($teamId === null || $leagueId === null || $season === null) {
                $this->error('Gebruik samen --team_id, --league_id en --season voor een gerichte import.');

                return self::FAILURE;
            }

            return $this->importSingleCombination((int) $teamId, (int) $leagueId, (int) $season, $date, $force);
        }

        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        return $this->importRelevantTeams($config['leagueId'], $config['season'], $date, $force);
    }

    private function importSingleCombination(
        int $teamId,
        int $leagueId,
        int $season,
        ?string $date,
        bool $force,
    ): int {
        try {
            $existing = $this->service->findExisting($teamId, $leagueId, $season, $date);
            $hasFixtureToday = $this->service->teamHasFixtureToday($teamId, $leagueId, $season);

            if (! $this->service->shouldRefresh($existing, $hasFixtureToday, $force)) {
                $this->line("Skipped {$teamId}/{$leagueId}/{$season}, statistics zijn nog vers.");

                return self::SUCCESS;
            }

            $statistic = $this->service->importForTeam($teamId, $leagueId, $season, $date, $force);
            $this->line("Imported {$statistic->statistics_key}");

            return self::SUCCESS;
        } catch (Exception $exception) {
            $this->error("Failed {$teamId}/{$leagueId}/{$season}: {$exception->getMessage()}");

            return self::FAILURE;
        }
    }

    private function importRelevantTeams(int $apiLeagueId, int $season, ?string $date, bool $force): int
    {
        $leagueId = League::query()->where('external_id', $apiLeagueId)->value('id');

        if (! is_numeric($leagueId)) {
            $this->error("League {$apiLeagueId} is niet lokaal gevonden.");

            return self::FAILURE;
        }

        $leagueId = (int) $leagueId;

        $fixtures = Fixture::query()
            ->with([
                'homeTeam:id,external_id',
                'awayTeam:id,external_id',
            ])
            ->whereNotNull('external_id')
            ->whereNotNull('home_team_id')
            ->whereNotNull('away_team_id')
            ->where('league_id', $leagueId)
            ->where('season', $season)
            ->relevantForDataSync()
            ->orderBy('match_date')
            ->get(['id', 'home_team_id', 'away_team_id']);

        if ($fixtures->isEmpty()) {
            $fixtures = Fixture::query()
                ->with([
                    'homeTeam:id,external_id',
                    'awayTeam:id,external_id',
                ])
                ->where('league_id', $leagueId)
                ->where('season', $season)
                ->get(['id', 'home_team_id', 'away_team_id']);
        }

        $apiTeamIds = $fixtures
            ->flatMap(fn (Fixture $fixture): array => [
                $fixture->homeTeam?->external_id,
                $fixture->awayTeam?->external_id,
            ])
            ->filter(fn (mixed $teamId): bool => is_numeric($teamId))
            ->map(fn (mixed $teamId): int => (int) $teamId)
            ->unique()
            ->values();

        if ($apiTeamIds->isEmpty()) {
            $this->info('Geen relevante teams gevonden voor team statistics import.');

            return self::SUCCESS;
        }

        foreach ($apiTeamIds as $apiTeamId) {
            try {
                $existing = $this->service->findExisting($apiTeamId, $apiLeagueId, $season, $date);
                $hasFixtureToday = $this->service->teamHasFixtureToday($apiTeamId, $apiLeagueId, $season);

                if (! $this->service->shouldRefresh($existing, $hasFixtureToday, $force)) {
                    $this->line("Skipped {$apiTeamId}/{$apiLeagueId}/{$season}, statistics zijn nog vers.");

                    continue;
                }

                $statistic = $this->service->importForTeam($apiTeamId, $apiLeagueId, $season, $date, $force);
                $this->line("Imported {$statistic->statistics_key}");
            } catch (Exception $exception) {
                if ($this->laravel->runningUnitTests()) {
                    throw $exception;
                }

                $this->error("Failed {$apiTeamId}/{$apiLeagueId}/{$season}: {$exception->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
