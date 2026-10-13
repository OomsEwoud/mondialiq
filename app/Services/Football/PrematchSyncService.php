<?php

namespace App\Services\Football;

use App\Models\Fixture;
use App\Services\Apis\ApiPriority;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureOddsService;
use App\Services\Prediction\PredictionService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class PrematchSyncService
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FootballApiBudget $budget,
        private readonly FixtureOddsService $odds,
        private readonly PredictionService $predictions,
    ) {}

    public function plan(string $dataset, int $days = 14, bool $includeRecent = false): array
    {
        $fixtures = Fixture::query()->forConfiguredCompetition()->whereNotNull('external_id')
            ->whereBetween('match_date', [now('Europe/Brussels')->subDays($includeRecent ? 7 : 0), now('Europe/Brussels')->addDays(max(1, $days))])
            ->with('league:id,external_id', 'apiPrediction:id,fixture_id,updated_at')
            ->withMax('fixtureOdds', 'updated_at')->orderBy('match_date')->orderBy('id')->get();
        $eligible = $fixtures->filter(fn (Fixture $fixture): bool => $this->eligible($fixture, $includeRecent));
        $due = $eligible->filter(fn (Fixture $fixture): bool => $this->due($dataset, $fixture));
        $groups = [];
        foreach ($fixtures->groupBy(fn (Fixture $fixture): string => $this->groupKey($fixture)) as $group) {
            $selected = $group->whereIn('id', $due->modelKeys());
            if ($dataset === 'odds' && $selected->count() >= 2 && $selected->count() === $group->count()) {
                $groups[] = $selected;
            } else {
                foreach ($selected as $fixture) {
                    $groups[] = new Collection([$fixture]);
                }
            }
        }

        return [
            'candidates' => $fixtures->count(), 'eligible' => $eligible->count(), 'due' => $due->count(),
            'status_skipped' => $fixtures->count() - $eligible->count(),
            'freshness_skipped' => $eligible->count() - $due->count(),
            'requests' => count($groups), 'old_requests' => $eligible->count(), 'groups' => $groups,
        ];
    }

    public function sync(string $dataset, int $days = 14, bool $includeRecent = false): array
    {
        $plan = $this->plan($dataset, $days, $includeRecent);
        $result = ['eligible' => $plan['eligible'], 'due' => $plan['due'], 'failed' => 0, 'deferred' => 0, 'stored' => 0, 'skipped' => 0];
        foreach ($plan['groups'] as $group) {
            $locks = [];
            $locked = new Collection;
            try {
                foreach ($group as $fixture) {
                    $lock = Cache::lock($this->key($dataset, $fixture).':lock', 3600);
                    if (! $lock->get()) {
                        continue;
                    }
                    $locks[] = $lock;
                    $fixture->refresh()->load('apiPrediction:id,fixture_id,updated_at')->loadMax('fixtureOdds', 'updated_at');
                    if ($this->eligible($fixture, $includeRecent) && $this->due($dataset, $fixture)) {
                        $locked->push($fixture);
                    }
                }
                if ($locked->isEmpty()) {
                    continue;
                }
                if (! $this->budget->available(ApiPriority::Normal)) {
                    throw new FootballApiBudgetExceeded(false);
                }
                // Only group a complete due matchday; partial groups retain individual queries.
                if ($dataset === 'odds' && $locked->count() > 1 && $locked->count() === $group->count()
                    && $locked->map(fn (Fixture $fixture): string => $this->groupKey($fixture))->unique()->count() === 1) {
                    $first = $locked->first();
                    $data = $this->api->getCompetitionOdds($first->league->external_id, $first->season, $this->kickoff($first)->utc()->toDateString());
                    $byFixture = collect($data)->groupBy('fixture.id');
                    foreach ($locked as $fixture) {
                        try {
                            $this->store($dataset, $fixture, ($byFixture[$fixture->external_id] ?? collect())->all(), $includeRecent, $result);
                        } catch (Throwable $exception) {
                            $this->failure($dataset, $fixture, $exception);
                            $result['failed']++;
                        }
                    }
                } else {
                    foreach ($locked as $fixture) {
                        try {
                            $data = $dataset === 'odds'
                                ? $this->api->getFixtureOdds((int) $fixture->external_id)
                                : $this->api->getFixturePrediction((int) $fixture->external_id);
                            $this->store($dataset, $fixture, $data, $includeRecent, $result);
                        } catch (FootballApiBudgetExceeded $exception) {
                            throw $exception;
                        } catch (Throwable $exception) {
                            $this->failure($dataset, $fixture, $exception);
                            $result['failed']++;
                        }
                    }
                }
            } catch (FootballApiBudgetExceeded) {
                $result['deferred'] += $locked->count();
                break;
            } catch (Throwable $exception) {
                foreach ($locked as $fixture) {
                    $this->failure($dataset, $fixture, $exception);
                }
                $result['failed'] += $locked->count();
            } finally {
                foreach ($locks as $lock) {
                    $lock->release();
                }
            }
        }

        return $result;
    }

    public function due(string $dataset, Fixture $fixture): bool
    {
        $state = Cache::get($this->key($dataset, $fixture));
        if ($state !== null && ($state['kickoff'] ?? null) !== $fixture->kickoffAt()) {
            return true;
        }
        $band = $this->band($fixture);
        if ($state !== null && ($state['band'] ?? null) === $band) {
            if (($state['empty_attempts'] ?? 0) >= 3 || ($state['failures'] ?? 0) >= 3) {
                return false;
            }
            if (($state['retry_at'] ?? 0) > now('UTC')->timestamp) {
                return false;
            }
        }
        $hours = $this->hours($dataset, $band);
        if (($state['empty_attempts'] ?? 0) > 0 && ($state['band'] ?? null) === $band) {
            $hours = max($hours, 12);
        }
        $checked = $state['checked_at'] ?? null;
        if ($state !== null && ($state['band'] ?? null) !== $band && ($state['empty_attempts'] ?? 0) > 0) {
            return true;
        }
        if ($checked === null && $state === null) {
            $local = $dataset === 'odds' ? $fixture->fixture_odds_max_updated_at : $fixture->apiPrediction?->updated_at;
            if ($local !== null && ! $fixture->updated_at->isAfter(CarbonImmutable::parse($local))) {
                $checked = CarbonImmutable::parse($local)->timestamp;
            }
        }

        return $checked === null || $checked <= now('UTC')->subHours($hours)->timestamp;
    }

    private function eligible(Fixture $fixture, bool $includeRecent): bool
    {
        return $fixture->isNotStarted() && $this->kickoff($fixture)->isFuture()
            || ($includeRecent && $this->kickoff($fixture)->isPast() && ($fixture->isNotStarted() || $fixture->isFinished()));
    }

    private function kickoff(Fixture $fixture): CarbonImmutable
    {
        return CarbonImmutable::parse($fixture->kickoffAt());
    }

    private function groupKey(Fixture $fixture): string
    {
        return $fixture->league->external_id.':'.$fixture->season.':'.$this->kickoff($fixture)->utc()->toDateString();
    }

    private function key(string $dataset, Fixture $fixture): string
    {
        return 'football:prematch:'.$dataset.':'.$fixture->league_id.':'.$fixture->season.':'.$fixture->external_id;
    }

    private function band(Fixture $fixture): string
    {
        $hours = now('UTC')->diffInHours($this->kickoff($fixture), false);

        return match (true) {
            $hours > 168 => 'far', $hours > 48 => 'week', default => 'near'
        };
    }

    private function hours(string $dataset, string $band): int
    {
        return ($dataset === 'odds' ? ['far' => 24, 'week' => 12, 'near' => 6] : ['far' => 72, 'week' => 48, 'near' => 24])[$band];
    }

    private function store(string $dataset, Fixture $fixture, array $data, bool $includeRecent, array &$result): void
    {
        $kickoff = $fixture->kickoffAt();
        $fixture->refresh();
        if ($fixture->kickoffAt() !== $kickoff || ! $this->eligible($fixture, $includeRecent)) {
            return;
        }
        if ($dataset === 'odds') {
            $summary = $this->odds->storeFixtureOdds($data, $fixture->id);
            $result['stored'] += $summary['stored'];
            $result['skipped'] += $summary['skipped'];
            $empty = $summary['stored'] === 0;
        } else {
            $empty = ! is_array(data_get($data, '0.predictions')) || data_get($data, '0.predictions') === [];
            if (! $empty) {
                $this->predictions->storeApiPrediction($data, $fixture->id);
                $result['stored']++;
            }
        }
        $previous = Cache::get($this->key($dataset, $fixture), []);
        $state = $this->state($dataset, $fixture);
        // A rescheduled fixture may reuse the endpoint response cache; do not extend its freshness.
        $responseTtl = (int) config('football_sync.reference_ttl./'.$dataset, 0);
        $state['checked_at'] = ($previous['checked_at'] ?? 0) > now('UTC')->subSeconds($responseTtl)->timestamp
            ? $previous['checked_at'] : now('UTC')->timestamp;
        $state['empty_attempts'] = $empty ? ($state['empty_attempts'] ?? 0) + 1 : 0;
        $state['failures'] = 0;
        $state['retry_at'] = 0;
        Cache::put($this->key($dataset, $fixture), $state, now('UTC')->addDays(30));
    }

    private function state(string $dataset, Fixture $fixture): array
    {
        $state = Cache::get($this->key($dataset, $fixture), []);
        if (($state['kickoff'] ?? null) !== $fixture->kickoffAt() || ($state['band'] ?? null) !== $this->band($fixture)) {
            return ['kickoff' => $fixture->kickoffAt(), 'band' => $this->band($fixture)];
        }

        return $state;
    }

    private function failure(string $dataset, Fixture $fixture, Throwable $exception): void
    {
        $state = $this->state($dataset, $fixture);
        $state['failures'] = ($state['failures'] ?? 0) + 1;
        $state['retry_at'] = now('UTC')->addHours(min(6, 2 ** ($state['failures'] - 1)))->timestamp;
        Cache::put($this->key($dataset, $fixture), $state, now('UTC')->addDays(30));
        Log::warning('football_sync.prematch_failed', ['dataset' => $dataset, 'fixture_id' => $fixture->id, 'exception' => $exception::class]);
    }
}
