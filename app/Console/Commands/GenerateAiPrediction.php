<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\AiPredictionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:generate-ai-prediction {fixture} {--dry-run}')]
#[Description('Genereer een AI prediction voor een fixture via OpenAI')]
class GenerateAiPrediction extends Command
{
    public function __construct(
        private readonly AiPredictionService $aiPredictionService,
        private readonly AiPredictionPromptBuilder $promptBuilder,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $fixtureId = (int) $this->argument('fixture');

        $fixture = Fixture::query()->find($fixtureId);

        if (! $fixture) {
            $this->error("Fixture {$fixtureId} niet gevonden.");

            return self::FAILURE;
        }

        if ($this->option('dry-run')) {
            $this->line('OpenAI instructions:');
            $this->line($this->promptBuilder->instructions());
            $this->newLine();
            $this->line('OpenAI input:');
            $this->line($this->promptBuilder->context($fixture));

            return self::SUCCESS;
        }

        try {
            $prediction = $this->aiPredictionService->predict($fixture);
        } catch (Throwable $exception) {
            $this->error("AI prediction kon niet gegenereerd worden: {$exception->getMessage()}");

            return self::FAILURE;
        }

        $this->info("AI prediction opgeslagen voor fixture {$fixture->id}.");
        $this->line("Home: {$prediction->home_chance}%");
        $this->line("Draw: {$prediction->draw_chance}%");
        $this->line("Away: {$prediction->away_chance}%");
        $this->line("Confidence: {$prediction->confidence}%");

        if ($prediction->home_goals !== null && $prediction->away_goals !== null) {
            $this->line("Expected score: {$prediction->home_goals}-{$prediction->away_goals}");
        }

        return self::SUCCESS;
    }
}
