<?php

namespace App\Services\Football;

use App\Models\Fixture;
use App\Services\Apis\ApiPriority;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Apis\FootballApiContext;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixturePlayerStatsService;
use App\Services\Fixture\FixtureService;
use App\Services\Fixture\FixtureStatsService;
use App\Services\Fixture\LiveFixtureService;
use App\Services\Player\PlayerService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class FixtureSyncService
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $fixtures,
        private readonly FixtureStatsService $statistics,
        private readonly FixtureEventsService $events,
        private readonly FixtureLineupService $lineups,
        private readonly FixturePlayerStatsService $players,
        private readonly LiveFixtureService $live,
        private readonly PlayerService $profiles,
        private readonly FootballApiBudget $budget,
    ) {}

    public static function candidates(string $phase): Builder
    {
        $query = Fixture::query()->whereNotNull('external_id')->forConfiguredCompetition();

        return match ($phase) {
            'pre-match' => $query->readyForLineupSync(),
            'post-match' => $query->where(fn (Builder $query) => $query->readyForFinalDataSync()->orWhere(fn (Builder $query) => $query->readyForPlayerStatsSync())),
            'player-stats' => $query->readyForPlayerStatsSync()->whereNull('player_stats_synced_at'),
            default => $query->relevantForFixtureDataSync()
                ->where(fn (Builder $query) => $query->whereNotIn('status_short', Fixture::FINISHED_STATUS_SHORTS)
                    ->orWhereNull('status_short')->orWhereNull('fulltime_home_goals')->orWhereNull('fulltime_away_goals'))
                ->where('match_date', '>=', now('Europe/Brussels')->subHours(6))
                ->where(fn (Builder $query) => $query->whereNull('fixture_basics_synced_at')
                    ->orWhere('fixture_basics_synced_at', '<=', now('UTC')->subSeconds(55))),
        };
    }

    public function run(string $phase, bool $batch = true, ?int $fixtureId = null, bool $historical = false, ?array $fixtureIds = null): int
    {
        if ($phase === 'live' && ! config('api-football.live_sync_enabled', true)) {
            return 0;
        }
        $priority = $historical ? ApiPriority::Background : ApiPriority::forPhase($phase);

        return app(FootballApiContext::class)->withPriority($priority,
            fn (): int => $this->runSelected($phase, $batch, $fixtureId, $historical, $fixtureIds, $priority));
    }

    private function runSelected(string $phase, bool $batch, ?int $fixtureId, bool $historical, ?array $fixtureIds, ApiPriority $priority): int
    {
        $failed = 0;
        $query = $this->selection($phase, $historical)->orderBy('match_date')->orderBy('id');
        if ($fixtureId !== null) {
            $query->whereKey($fixtureId);
        }
        if ($fixtureIds !== null) {
            $query->whereKey($fixtureIds);
        }
        if ($historical && $fixtureId === null) {
            throw new \InvalidArgumentException('Historical sync requires an explicit fixture ID.');
        }

        foreach ($query->with(['homeTeam', 'awayTeam'])->limit((int) config('football_sync.max_fixtures_per_run', 100))->get()->chunk($batch ? 20 : 1) as $chunk) {
            if (! $this->budget->available($priority)) {
                Log::info('football_sync.deferred', ['phase' => $phase, 'reason' => 'api_budget']);

                break;
            }
            $locked = [];
            $locks = [];
            $attempts = [];
            try {
                foreach ($chunk as $fixture) {
                    $lock = Cache::lock('football:fixture:'.$fixture->id, 3600);
                    if (! $lock->get()) {
                        continue;
                    }
                    $locks[] = $lock;
                    if (! $this->selection($phase, $historical)->whereKey($fixture->id)->exists()) {
                        continue;
                    }
                    $fixture->refresh();
                    $attempts[$fixture->id] = $this->recordAttempts($fixture, $phase);
                    $locked[$fixture->external_id] = $fixture;
                }

                if ($locked === []) {
                    continue;
                }

                $payloads = $batch && $phase !== 'pre-match' && $phase !== 'player-stats'
                    ? collect($this->api->getFixturesByIds(array_keys($locked)))->keyBy('fixture.id')->all()
                    : [];

                foreach ($locked as $externalId => $fixture) {
                    try {
                        if ($batch && ! in_array($phase, ['pre-match', 'player-stats'], true) && ! isset($payloads[$externalId])) {
                            throw new RuntimeException('Fixture missing from batch response.');
                        }
                        $this->sync($fixture, $phase, $payloads[$externalId] ?? null, $attempts[$fixture->id]);
                    } catch (Throwable $exception) {
                        $this->releaseDeferredAttempts($fixture, $attempts[$fixture->id], $exception);
                        if (! $exception instanceof FootballApiBudgetExceeded) {
                            $failed++;
                            $this->recordFailure($fixture, $exception);
                        }
                    }
                }
            } catch (Throwable $exception) {
                foreach ($locked as $fixture) {
                    $this->releaseDeferredAttempts($fixture, $attempts[$fixture->id], $exception);
                }
                if (! $exception instanceof FootballApiBudgetExceeded) {
                    $failed += count($locked) ?: 1;
                    Log::warning('football_sync.batch_failed', ['phase' => $phase, 'exception' => $exception::class]);
                }
            } finally {
                foreach ($locks as $lock) {
                    $lock->release();
                }
            }
        }

        return $failed;
    }

    private function selection(string $phase, bool $historical): Builder
    {
        if (! $historical) {
            return $this->candidates($phase);
        }

        return Fixture::query()->whereNotNull('external_id')->finished()
            ->where(fn (Builder $query) => $query
                ->where(fn (Builder $query) => $query->whereNull('final_data_synced_at')->where('final_data_sync_attempts', '<', config('football_sync.final_max_attempts', 3))
                    ->where(fn (Builder $query) => $query->whereNull('final_data_attempted_at')->orWhere('final_data_attempted_at', '<=', now('UTC')->subMinutes(15))))
                ->orWhere(fn (Builder $query) => $query->where(fn (Builder $query) => $query->whereNull('player_stats_synced_at')->orWhere('has_lineups', false))->where('player_stats_sync_attempts', '<', config('football_sync.final_max_attempts', 3))
                    ->where(fn (Builder $query) => $query->whereNull('player_stats_attempted_at')->orWhere('player_stats_attempted_at', '<=', now('UTC')->subMinutes(15)))));
    }

    private function recordAttempts(Fixture $fixture, string $phase): array
    {
        $attempts = ['final_data' => false, 'player_stats' => false, 'lineups' => false];
        if ($phase === 'pre-match') {
            $fixture->forceFill(['lineups_synced_at' => now('UTC'), 'lineup_sync_attempts' => $fixture->lineup_sync_attempts + 1])->save();
            $attempts['lineups'] = true;

            return $attempts;
        }
        if ($fixture->isFinished()) {
            if (! $this->budget->available(ApiPriority::High)) {
                return $attempts;
            }
            $attributes = [];
            if ($phase !== 'player-stats' && $fixture->final_data_synced_at === null && $this->due($fixture, 'final_data')) {
                $attributes['final_data_sync_attempts'] = $fixture->final_data_sync_attempts + 1;
                $attributes['final_data_attempted_at'] = now('UTC');
                $attempts['final_data'] = true;
            }
            if (in_array($phase, ['post-match', 'player-stats'], true) && ($fixture->player_stats_synced_at === null || ! $fixture->has_lineups) && $this->due($fixture, 'player_stats')) {
                $attributes['player_stats_sync_attempts'] = $fixture->player_stats_sync_attempts + 1;
                $attributes['player_stats_attempted_at'] = now('UTC');
                $attempts['player_stats'] = true;
            }
            $fixture->forceFill($attributes)->save();
        }

        return $attempts;
    }

    private function sync(Fixture $fixture, string $phase, ?array $payload, array &$attempts): void
    {
        if ($phase === 'pre-match') {
            $this->storeLineups($fixture, $this->api->getFixtureLineups((int) $fixture->external_id));

            return;
        }
        if ($phase === 'player-stats') {
            $this->storePlayers($fixture, $this->api->getFixturePlayersStats((int) $fixture->external_id));

            return;
        }

        $wasFinished = $fixture->isFinished();
        $payload ??= $this->api->getFixture((int) $fixture->external_id)[0] ?? null;
        if ($payload === null) {
            throw new RuntimeException('Fixture missing from API response.');
        }

        $this->fixtures->storeFixtures([$payload]);
        $fixture->refresh();
        $this->live->forgetCache();
        if (! $wasFinished && $fixture->isFinished()) {
            $attempts = $this->recordAttempts($fixture, $phase);
        }

        if (! empty($payload['lineups']) && $fixture->shouldSyncLineups()) {
            $this->storeLineups($fixture, $payload['lineups']);
        }

        if ($fixture->isLive()) {
            $this->runDatasets([
                'events' => fn () => $this->events->storeFixtureEvents($this->dataset($payload, 'events', $fixture), $fixture->id),
                'statistics' => fn () => $this->statistics->storeFixtureStats($this->dataset($payload, 'statistics', $fixture), $fixture->id),
            ]);
        } elseif ($fixture->isFinished()) {
            $tasks = [];
            if ($fixture->final_data_synced_at === null && $attempts['final_data']) {
                $tasks['final_data'] = fn () => $this->storeFinalData($fixture, $payload);
            }
            if ($phase === 'post-match' && $attempts['player_stats']) {
                if (! $fixture->has_lineups) {
                    $tasks['lineups'] = fn () => $this->storeLineups($fixture, $this->dataset($payload, 'lineups', $fixture));
                }
                if ($fixture->player_stats_synced_at === null) {
                    $tasks['players'] = fn () => $this->storePlayers($fixture, $this->dataset($payload, 'players', $fixture));
                }
            }
            $this->runDatasets($tasks);
        }
    }

    private function dataset(array $payload, string $key, Fixture $fixture): array
    {
        if (array_key_exists($key, $payload) && is_array($payload[$key])) {
            return $payload[$key];
        }

        $priority = $key === 'events' && $fixture->isLive() ? ApiPriority::Critical : ApiPriority::High;
        if (app(FootballApiContext::class)->priority('/fixtures', []) === ApiPriority::Background) {
            $priority = ApiPriority::Background;
        }

        return app(FootballApiContext::class)->withPriority($priority, fn (): array => match ($key) {
            'statistics' => $this->api->getFixtureStats((int) $fixture->external_id),
            'events' => $this->api->getFixtureEvents((int) $fixture->external_id),
            'lineups' => $this->api->getFixtureLineups((int) $fixture->external_id),
            'players' => $this->api->getFixturePlayersStats((int) $fixture->external_id),
        });
    }

    private function storeFinalData(Fixture $fixture, array $payload): void
    {
        $tasks = [];
        if ($fixture->statistics_synced_at === null) {
            $tasks['statistics'] = function () use ($fixture, $payload): void {
                $statistics = $this->dataset($payload, 'statistics', $fixture);
                DB::transaction(function () use ($fixture, $statistics): void {
                    $this->statistics->storeFixtureStats($statistics, $fixture->id);
                    if ($this->hasBothTeams($fixture, $statistics, 'statistics')) {
                        $fixture->forceFill(['statistics_synced_at' => now('UTC')])->save();
                    }
                });
            };
        }
        if ($fixture->events_synced_at === null) {
            $tasks['events'] = function () use ($fixture, $payload): void {
                $events = $this->dataset($payload, 'events', $fixture);
                DB::transaction(function () use ($fixture, $events): void {
                    $this->events->storeFixtureEvents($events, $fixture->id);
                    if ($events !== [] || ($fixture->fulltime_home_goals === 0 && $fixture->fulltime_away_goals === 0)) {
                        $fixture->forceFill(['events_synced_at' => now('UTC')])->save();
                    }
                });
            };
        }
        $this->runDatasets($tasks);
        if ($fixture->statistics_synced_at !== null && $fixture->events_synced_at !== null) {
            $fixture->forceFill(['final_data_synced_at' => now('UTC')])->save();
        }
    }

    private function runDatasets(array $tasks): void
    {
        $failed = false;
        $deferred = null;
        foreach ($tasks as $dataset => $task) {
            try {
                $task();
            } catch (FootballApiBudgetExceeded $exception) {
                $deferred = $exception;
            } catch (Throwable $exception) {
                $failed = true;
                Log::warning('football_sync.dataset_failed', ['dataset' => $dataset, 'exception' => $exception::class]);
            }
        }
        if ($failed) {
            throw new RuntimeException('One or more football datasets failed to sync.');
        }
        if ($deferred !== null) {
            throw $deferred;
        }
    }

    private function releaseDeferredAttempts(Fixture $fixture, array $attempts, Throwable $exception): void
    {
        if (! $exception instanceof FootballApiBudgetExceeded || $exception->attempted) {
            return;
        }
        if ($attempts['lineups']) {
            $fixture->forceFill(['lineup_sync_attempts' => max(0, $fixture->lineup_sync_attempts - 1), 'lineups_synced_at' => null])->save();
        }
        foreach (['final_data', 'player_stats'] as $dataset) {
            if ($attempts[$dataset] && ($fixture->{$dataset.'_synced_at'} === null || ($dataset === 'player_stats' && ! $fixture->has_lineups))) {
                $fixture->forceFill([
                    $dataset.'_sync_attempts' => max(0, $fixture->{$dataset.'_sync_attempts'} - 1),
                    $dataset.'_attempted_at' => null,
                ])->save();
            }
        }
    }

    private function storeLineups(Fixture $fixture, array $lineups): void
    {
        DB::transaction(function () use ($fixture, $lineups): void {
            $stored = $this->lineups->storeLineups($lineups, $fixture->id);
            $complete = $stored && $this->hasBothTeams($fixture, $lineups, 'startXI', 11);
            $fixture->forceFill(['has_lineups' => $fixture->has_lineups || $complete])->save();
            if ($complete) {
                $fixture->forceFill(['lineups_synced_at' => now('UTC')])->save();
            }
        });
    }

    private function storePlayers(Fixture $fixture, array $players): void
    {
        DB::transaction(function () use ($fixture, $players): void {
            $this->profiles->storePlayers(collect($players)->flatMap(fn (array $team): array => $team['players'] ?? [])->all());
            $summary = $this->players->storeFixturePlayerStats($players, $fixture->id);
            $hasStatistics = collect($players)->flatMap(fn (array $team): array => $team['players'] ?? [])
                ->every(fn (array $player): bool => ! empty($player['statistics']));
            if ($this->hasBothTeams($fixture, $players, 'players', 11) && $hasStatistics && $summary['processed'] > 0 && $summary['skipped'] === 0) {
                $fixture->forceFill(['player_stats_synced_at' => now('UTC')])->save();
            }
        });
    }

    private function hasBothTeams(Fixture $fixture, array $data, string $key, int $minimum = 1): bool
    {
        $expected = [(int) $fixture->homeTeam->external_id, (int) $fixture->awayTeam->external_id];
        $actual = collect($data)->filter(function (array $team) use ($key, $minimum): bool {
            $entries = collect(is_array($team[$key] ?? null) ? $team[$key] : []);
            $valid = $key === 'statistics'
                ? $entries->filter(fn ($entry): bool => is_string(data_get($entry, 'type')) && data_get($entry, 'type') !== '')
                : $entries->filter(fn ($entry): bool => is_numeric(data_get($entry, 'player.id')))->unique('player.id');

            return $valid->count() >= $minimum;
        })
            ->pluck('team.id')->map(fn ($id): int => (int) $id)->all();

        return count(array_intersect($expected, $actual)) === 2;
    }

    private function due(Fixture $fixture, string $dataset): bool
    {
        return $fixture->{$dataset.'_sync_attempts'} < config('football_sync.final_max_attempts', 3)
            && ($fixture->{$dataset.'_attempted_at'} === null || $fixture->{$dataset.'_attempted_at'}->lte(now('UTC')->subMinutes(15)));
    }

    private function recordFailure(Fixture $fixture, Throwable $exception): void
    {
        Log::warning('football_sync.fixture_failed', ['fixture_id' => $fixture->id, 'exception' => $exception::class]);
    }
}
