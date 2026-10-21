<?php

namespace App\Services\MachineLearning;

use App\Models\Fixture;
use App\Models\League;
use App\Models\MlImportBatch;
use App\Services\Apis\ApiPriority;
use App\Services\Apis\FootballApiBudget;
use App\Services\Apis\FootballApiBudgetExceeded;
use App\Services\Apis\FootballApiContext;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use App\Services\Football\CompetitionConfig;
use App\Services\League\LeagueService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class HistoricalDataImporter
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FootballApiBudget $budget,
        private readonly FootballApiContext $context,
        private readonly FixtureService $fixtures,
        private readonly HistoricalFixtureContract $contract,
        private readonly LeagueService $leagues,
    ) {}

    public function latest(CompetitionConfig $competition): ?MlImportBatch
    {
        if (! Schema::hasTable('ml_import_batches')) {
            return null;
        }

        return MlImportBatch::query()->where('provider_league_id', $competition->leagueId)->where('season', $competition->season)->latest('id')->first();
    }

    public function run(CompetitionConfig $competition, bool $force = false): array
    {
        if (! Schema::hasTable('ml_import_batches')) {
            throw new RuntimeException('Run php artisan migrate before importing historical ML data.');
        }
        $lock = Cache::lock('football:calendar:'.$competition->key(), 3600);
        if (! $lock->get()) {
            return ['status' => 'locked'];
        }
        try {
            $batch = $this->latest($competition);
            if ($batch?->completed_at && ! $force) {
                $expected = array_column(array_column($batch->payload, 'fixture'), 'id');
                if ($competition->constrain(Fixture::query())->whereIn('external_id', $expected)->count() !== count($expected)) {
                    throw new RuntimeException('Local fixtures missing from imported snapshot; inspect audit and use --force to restore safely.');
                }

                return ['status' => 'already_imported', 'batch_id' => $batch->id];
            }
            if (! League::query()->where('external_id', $competition->leagueId)->exists()) {
                $metadata = $this->context->withPriority(ApiPriority::Background,
                    fn (): array => $this->api->getLeagueSeason($competition->leagueId, $competition->season));
                if (count($metadata) !== 1 || data_get($metadata, '0.league.id') !== $competition->leagueId
                    || ! in_array($competition->season, array_column($metadata[0]['seasons'] ?? [], 'year'), true)) {
                    throw new RuntimeException('Missing or mismatched league/season metadata.');
                }
                $this->leagues->storeLeagues($metadata);
                if (! League::query()->where('external_id', $competition->leagueId)->exists()) {
                    throw new RuntimeException('Invalid league metadata.');
                }
            }
            if ($batch === null || ($batch->completed_at && $force)) {
                if (! $this->budget->available(ApiPriority::Background)) {
                    return ['status' => 'quota_deferred'];
                }
                $payload = $this->contract->validate($this->context->withPriority(ApiPriority::Background,
                    fn (): array => $this->api->getHistoricalFixtures($competition->leagueId, $competition->season)), $competition);
                $batch = MlImportBatch::query()->create([
                    'provider_league_id' => $competition->leagueId, 'season' => $competition->season,
                    'payload' => $payload, 'payload_sha256' => $this->contract->checksum($payload), 'fetched_at' => now('UTC'),
                ]);
            }
            $payload = $batch->payload;
            if (! hash_equals($batch->payload_sha256, $this->contract->checksum($payload))) {
                throw new RuntimeException('Stored import payload checksum mismatch.');
            }
            $this->contract->validate($payload, $competition);
            foreach (array_slice($payload, $batch->next_index, null, true) as $index => $row) {
                DB::transaction(function () use ($row, $batch, $index): void {
                    // Existing scheduler stores Brussels wall time; keep the shared storage convention.
                    $row['fixture']['date'] = CarbonImmutable::parse($row['fixture']['date'])->setTimezone('Europe/Brussels')->toIso8601String();
                    $row['goals'] = $row['score']['fulltime'];
                    $stats = $this->fixtures->storeFixtures([$row], protectHistoricalResults: true);
                    if ($stats['imported'] + $stats['skipped'] !== 1) {
                        throw new RuntimeException('Historical fixture was not stored.');
                    }
                    $batch->update(['next_index' => $index + 1]);
                });
            }
            $batch->update(['completed_at' => now('UTC')]);

            return ['status' => 'imported', 'batch_id' => $batch->id, 'fixtures' => count($payload), 'payload_sha256' => $batch->payload_sha256];
        } catch (FootballApiBudgetExceeded) {
            return ['status' => 'quota_deferred'];
        } catch (\Throwable $exception) {
            Log::warning('ml.import_failed', ['competition' => $competition->key(), 'exception' => $exception::class]);
            throw $exception;
        } finally {
            $lock->release();
        }
    }
}
