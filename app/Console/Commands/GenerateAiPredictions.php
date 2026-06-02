<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Fixture;
use App\Services\Prediction\AiPredictionService;

#[Signature('app:generate-ai-predictions {--days=14} {--force}')]
#[Description('Command description')]
class GenerateAiPredictions extends Command
{
    public function __construct(
        private readonly AiPredictionService $aiPredictionService,
    ) {
        parent::__construct();
    }
    public function handle()
    {
        $fixtures = Fixture::query()
            ->whereNotNull('external_id')
            ->where('match_date', '>=', now())
            ->where('match_date', '<=', now()->addDays((int) $this->option('days')))
            ->when(! $this->option('force'), function ($query): void {
                $query->whereDoesntHave('aiPrediction');
            })
            ->orderBy('match_date')
            ->get();

        foreach ($fixtures as $fixture) {
            $this->aiPredictionService->predict($fixture);
        }
    }
}
