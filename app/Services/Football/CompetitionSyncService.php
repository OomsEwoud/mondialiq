<?php

namespace App\Services\Football;

use App\Models\Fixture;
use App\Services\Apis\ApiPriority;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Apis\FootballApiContext;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use App\Services\Standing\StandingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CompetitionSyncService
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $fixtures,
        private readonly StandingService $standings,
    ) {}

    public function fixtures(): void
    {
        foreach (CompetitionConfig::configured() as $competition) {
            $lock = Cache::lock('football:calendar:'.$competition->key(), 120);
            if (! $lock->get()) {
                continue;
            }
            try {
                $key = 'football:calendar-imported:v2:'.$competition->key();
                $initial = ! Cache::has($key);
                $from = now('Europe/Brussels')->subDays(3)->startOfDay();
                $to = now('Europe/Brussels')->addDays(14)->endOfDay();
                $data = $initial
                    ? $this->api->getFixtures($competition->leagueId, $competition->season)
                    : $this->api->getFixturesInWindow($competition->leagueId, $competition->season, now('Europe/Brussels')->subDays(3)->toDateString(), now('Europe/Brussels')->addDays(14)->toDateString());
                $stored = $this->fixtures->storeFixtures($data);
                if ($initial && $data !== [] && ($stored['imported'] > 0 || $competition->constrain(Fixture::query())->exists())) {
                    Cache::put($key, true, now()->addDays((int) config('football_sync.calendar_full_refresh_days', 7)));
                }
                if (! $initial) {
                    $received = array_column(array_column($data, 'fixture'), 'id');
                    $missing = $competition->constrain(Fixture::query())
                        ->whereNotNull('external_id')
                        ->whereNotIn('external_id', $received)
                        ->where(function (Builder $query) use ($from, $to): void {
                            $query->where('status_short', 'PST')
                                ->orWhere(function (Builder $query) use ($from, $to): void {
                                    $query->whereBetween('match_date', [$from, $to])
                                        ->whereNotIn('status_short', ['FT', 'AET', 'PEN', 'CANC', 'AWD', 'WO']);
                                });
                        })
                        ->orderBy('id')->pluck('external_id');
                    foreach ($missing->chunk(config('football_sync.batch_fixtures') ? 20 : 1) as $ids) {
                        $data = app(FootballApiContext::class)->withPriority(ApiPriority::Normal, fn (): array => config('football_sync.batch_fixtures')
                            ? $this->api->getFixturesByIds($ids->map(fn ($id): int => (int) $id)->all())
                            : $this->api->getFixture((int) $ids->first()));
                        $this->fixtures->storeFixtures($data);
                    }
                }
            } finally {
                $lock->release();
            }
        }
    }

    public function standings(): int
    {
        $failed = 0;
        foreach (CompetitionConfig::configured() as $competition) {
            $key = 'football:standings:v2:'.$competition->key();
            $lock = Cache::lock($key.':lock', 120);
            if (! $lock->get()) {
                continue;
            }
            try {
                $plan = $this->standingsPlan($competition);
                if (! $plan['due']) {
                    continue;
                }
                if (! app(FootballApiBudget::class)->available(ApiPriority::Normal)) {
                    break;
                }
                $data = $this->api->getStandings($competition->leagueId, $competition->season);
                if ($data !== []) {
                    $this->standings->storeStandings($data);
                }
                Cache::put($key, [
                    'checked_at' => now('UTC')->timestamp, 'signature' => $plan['signature'],
                    'empty' => $data === [], 'failures' => 0,
                ], now('UTC')->addDays(14));
            } catch (FootballApiBudgetExceeded) {
                break;
            } catch (\Throwable $exception) {
                $state = Cache::get($key, []);
                $state['failures'] = ($state['failures'] ?? 0) + 1;
                $state['retry_at'] = now('UTC')->addHours($state['failures'] >= 3 ? 24 : 1)->timestamp;
                Cache::put($key, $state, now('UTC')->addDays(14));
                Log::warning('football_sync.standings_failed', ['competition' => $competition->key(), 'exception' => $exception::class]);
                $failed++;
            } finally {
                $lock->release();
            }
        }

        return $failed;
    }

    public function standingsPlan(CompetitionConfig $competition): array
    {
        $query = $competition->constrain(Fixture::query());
        $fixtures = (clone $query)->whereBetween('match_date', [now('Europe/Brussels')->subDays(7), now('Europe/Brussels')->addDays(7)])
            ->orderBy('id')->get(['id', 'match_date', 'status_short', 'status_long', 'fulltime_home_goals', 'fulltime_away_goals']);
        $played = $fixtures->filter(fn (Fixture $fixture): bool => $fixture->isFinished());
        $signature = hash('sha256', $played->map(fn (Fixture $fixture): array => [
            $fixture->id, $fixture->status_short, $fixture->fulltime_home_goals, $fixture->fulltime_away_goals,
        ])->toJson());
        $recent = $fixtures->contains(fn (Fixture $fixture): bool => ($fixture->isLive() || $fixture->isFinished())
            && $fixture->match_date->format('Y-m-d H:i:s') >= now('Europe/Brussels')->subHours(4)->format('Y-m-d H:i:s')
            && $fixture->match_date->format('Y-m-d H:i:s') <= now('Europe/Brussels')->format('Y-m-d H:i:s'));
        $soon = $fixtures->contains(fn (Fixture $fixture): bool => $fixture->isNotStarted()
            && $fixture->match_date->format('Y-m-d H:i:s') >= now('Europe/Brussels')->format('Y-m-d H:i:s')
            && $fixture->match_date->format('Y-m-d H:i:s') <= now('Europe/Brussels')->addHours(24)->format('Y-m-d H:i:s'));
        $active = $fixtures->contains(fn (Fixture $fixture): bool => $fixture->isNotStarted() || $fixture->isLive() || $fixture->isFinished());
        $state = Cache::get('football:standings:v2:'.$competition->key(), []);
        $hours = $recent ? 1 : ($soon ? 6 : ($active ? 24 : 168));
        if (isset($state['signature']) && $state['signature'] !== $signature) {
            $hours = 1;
        } elseif (($state['empty'] ?? false)) {
            $hours = $active ? 24 : 168;
        }
        $due = ($state['retry_at'] ?? 0) <= now('UTC')->timestamp
            && (! isset($state['checked_at']) || $state['checked_at'] <= now('UTC')->subHours($hours)->timestamp);
        $oldActive = $fixtures->contains(fn (Fixture $fixture): bool => $fixture->match_date->format('Y-m-d H:i:s') >= now('Europe/Brussels')->subDay()->format('Y-m-d H:i:s')
            && $fixture->match_date->format('Y-m-d H:i:s') <= now('Europe/Brussels')->addDay()->format('Y-m-d H:i:s'));

        return ['due' => $due, 'signature' => $signature, 'hours' => $hours, 'fixtures' => $fixtures->count(), 'old_daily_calls' => $oldActive ? 24 : 1];
    }

    public function fixturesQuery(): Builder
    {
        return Fixture::query()->forConfiguredCompetition();
    }
}
