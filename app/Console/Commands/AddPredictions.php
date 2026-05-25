<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Prediction\PredictionService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-predictions')]
#[Description('Haal voorspellingen op uit de Football API en sla ze op')]
class AddPredictions extends Command
{
    public function __construct(
        protected FootballApiService $api,
        protected PredictionService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starten met ophalen van voorspellingen');

        $fixtures = Fixture::query()
            ->whereNotNull('external_id')
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor voorspellingen sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $predictionData = $this->api->getFixturePrediction($fixture->external_id);
                $this->service->storeApiPrediction($predictionData, $fixture->id);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen voorspelling voor fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Alle voorspellingen zijn geupdate');

        return self::SUCCESS;
    }
}
