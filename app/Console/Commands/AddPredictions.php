<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Prediction\PredictionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Throwable;

#[Signature('app:add-predictions')]
#[Description('Haal voorspellingen op uit de Football API en sla ze op')]
class AddPredictions extends Command
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly PredictionService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starten met ophalen van voorspellingen');

        $fixtures = $this->fixturesForPredictionSync();

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor voorspellingen sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $failed = 0;
        $this->withProgressBar($fixtures, function (Fixture $fixture) use ($failed): void {
            try {
                $this->syncFixturePrediction($fixture);
            } catch (Throwable $exception) {
                $failed++;
                $this->newLine();
                $this->error("Fout bij ophalen voorspelling voor fixture {$fixture->id}: {$exception->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Alle voorspellingen zijn geupdate');

        if ($failed > 0) {
            $this->error("Er zijn {$failed} voorspellingen niet gesynchroniseerd vanwege fouten.");
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @return Collection<int, Fixture>
     */
    private function fixturesForPredictionSync(): Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);
    }

    private function syncFixturePrediction(Fixture $fixture): void
    {
        $predictionData = $this->api->getFixturePrediction((int) $fixture->external_id);

        $this->service->storeApiPrediction($predictionData, $fixture->id);
    }
}
