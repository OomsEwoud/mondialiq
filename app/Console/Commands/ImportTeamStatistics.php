<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Models\Fixture;
use App\Models\League;
use App\Services\TeamStatisticsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Throwable;

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
        private readonly TeamStatisticsService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $options = $this->importOptions();

        if ($this->hasTargetedImportOptions($options)) {
            return $this->handleTargetedImport($options);
        }

        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        return $this->importRelevantTeams($config['leagueId'], $config['season'], $options['date'], $options['force']);
    }

    private function handleTargetedImport(array $options): int
    {
        if (! $this->hasCompleteTargetedImportOptions($options)) {
            $this->error('Gebruik samen --team_id, --league_id en --season voor een gerichte import.');

            return self::FAILURE;
        }

        return $this->importSingleCombination(
            (int) $options['teamId'],
            (int) $options['leagueId'],
            (int) $options['season'],
            $options['date'],
            $options['force'],
        );
    }

    private function importOptions(): array
    {
        $date = $this->option('date');

        return [
            'teamId' => $this->option('team_id'),
            'leagueId' => $this->option('league_id'),
            'season' => $this->option('season'),
            'date' => is_string($date) && $date !== '' ? $date : null,
            'force' => (bool) $this->option('force'),
        ];
    }

    private function hasTargetedImportOptions(array $options): bool
    {
        return $options['teamId'] !== null || $options['leagueId'] !== null || $options['season'] !== null;
    }

    private function hasCompleteTargetedImportOptions(array $options): bool
    {
        return $options['teamId'] !== null && $options['leagueId'] !== null && $options['season'] !== null;
    }

    private function importSingleCombination(
        int $teamId,
        int $leagueId,
        int $season,
        ?string $date,
        bool $force,
    ): int {
        try {
            $this->importTeamStatistic($teamId, $leagueId, $season, $date, $force);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error("Failed {$teamId}/{$leagueId}/{$season}: {$exception->getMessage()}");

            return self::FAILURE;
        }
    }

    private function importRelevantTeams(int $apiLeagueId, int $season, ?string $date, bool $force): int
    {
        $localLeagueId = $this->localLeagueId($apiLeagueId);

        if ($localLeagueId === null) {
            $this->error("League {$apiLeagueId} is niet lokaal gevonden.");

            return self::FAILURE;
        }

        $apiTeamIds = $this->apiTeamIdsForLeague($localLeagueId, $season);

        if ($apiTeamIds->isEmpty()) {
            $this->info('Geen relevante teams gevonden voor team statistics import.');

            return self::SUCCESS;
        }

        foreach ($apiTeamIds as $apiTeamId) {
            $this->importRelevantTeamStatistic($apiTeamId, $apiLeagueId, $season, $date, $force);
        }

        return self::SUCCESS;
    }

    private function importRelevantTeamStatistic(
        int $teamId,
        int $leagueId,
        int $season,
        ?string $date,
        bool $force,
    ): void {
        try {
            $this->importTeamStatistic($teamId, $leagueId, $season, $date, $force);
        } catch (Throwable $exception) {
            if ($this->laravel->runningUnitTests()) {
                throw $exception;
            }

            $this->error("Failed {$teamId}/{$leagueId}/{$season}: {$exception->getMessage()}");
        }
    }

    private function localLeagueId(int $apiLeagueId): ?int
    {
        $leagueId = League::query()->where('external_id', $apiLeagueId)->value('id');

        return is_numeric($leagueId) ? (int) $leagueId : null;
    }

    private function apiTeamIdsForLeague(int $leagueId, int $season): Collection
    {
        $fixtures = $this->relevantFixturesForTeamStatistics($leagueId, $season);

        if ($fixtures->isEmpty()) {
            $fixtures = $this->allFixturesForTeamStatistics($leagueId, $season);
        }

        return $this->apiTeamIds($fixtures);
    }

    private function relevantFixturesForTeamStatistics(int $leagueId, int $season): EloquentCollection
    {
        return $this->teamStatisticsFixtureQuery($leagueId, $season)
            ->whereNotNull('external_id')
            ->relevantForDataSync()
            ->orderBy('match_date')
            ->get(['id', 'home_team_id', 'away_team_id']);
    }

    private function allFixturesForTeamStatistics(int $leagueId, int $season): EloquentCollection
    {
        return $this->teamStatisticsFixtureQuery($leagueId, $season)
            ->get(['id', 'home_team_id', 'away_team_id']);
    }

    private function teamStatisticsFixtureQuery(int $leagueId, int $season): Builder
    {
        return Fixture::query()
            ->with([
                'homeTeam:id,external_id',
                'awayTeam:id,external_id',
            ])
            ->whereNotNull('home_team_id')
            ->whereNotNull('away_team_id')
            ->where('league_id', $leagueId)
            ->where('season', $season);
    }

    private function apiTeamIds(EloquentCollection $fixtures): Collection
    {
        return $fixtures
            ->flatMap(fn (Fixture $fixture): array => [
                $fixture->homeTeam?->external_id,
                $fixture->awayTeam?->external_id,
            ])
            ->filter(fn (mixed $teamId): bool => is_numeric($teamId))
            ->map(fn (mixed $teamId): int => (int) $teamId)
            ->unique()
            ->values();
    }

    private function importTeamStatistic(
        int $teamId,
        int $leagueId,
        int $season,
        ?string $date,
        bool $force,
    ): void {
        $existing = $this->service->findExisting($teamId, $leagueId, $season, $date);
        $hasFixtureToday = $this->service->teamHasFixtureToday($teamId, $leagueId, $season);

        if (! $this->service->shouldRefresh($existing, $hasFixtureToday, $force)) {
            $this->line("Skipped {$teamId}/{$leagueId}/{$season}, statistics zijn nog vers.");

            return;
        }

        $statistic = $this->service->importForTeam($teamId, $leagueId, $season, $date, $force);
        $this->line("Imported {$statistic->statistics_key}");
    }
}
