<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Prediction\PredictionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use App\Models\Fixture;
use Illuminate\Console\Command;
use Exception;

#[Signature('app:add-predictions')]
#[Description('Command description')]
class AddPredictions extends Command
{
    public function __construct(protected FootballApiService $api, protected PredictionService $service)
    {
        parent::__construct();
    }

    
    public function handle()
    {
        $this->info('Starten met ophalen van voorspellingen');
        $fixtures = Fixture::all();

        $this->withProgressBar($fixtures, function ($fixture){
            try {
                $predictionData = $this->api->getFixturePrediction($fixture->external_id);
                $this->service->storeApiPrediction($predictionData, $fixture->id);
            } catch (Exception $e) {
                $this->info("Fout bij ophalen voorspelling voor fixture {$fixture->id}: " . $e->getMessage());
            }
        });
        
        $this->newLine();
        $this->info('Alle voorspellingen zijn geupdate');
    }
}
