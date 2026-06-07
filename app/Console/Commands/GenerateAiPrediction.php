<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Models\Prediction;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\AiPredictionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:generate-ai-prediction {fixture} {--dry-run} {--show-instructions}')]
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

        $fixture = $this->findFixture($fixtureId);

        if (! $fixture) {
            $this->error("Fixture {$fixtureId} niet gevonden.");

            return self::FAILURE;
        }

        if ($this->option('dry-run')) {
            return $this->showDryRun($fixture);
        }

        try {
            $prediction = $this->aiPredictionService->predict($fixture);
        } catch (Throwable $exception) {
            $this->error("AI prediction kon niet gegenereerd worden: {$exception->getMessage()}");

            return self::FAILURE;
        }

        $this->showStoredPrediction($fixture, $prediction);

        return self::SUCCESS;
    }

    private function findFixture(int $fixtureId): ?Fixture
    {
        return Fixture::query()->find($fixtureId);
    }

    private function showDryRun(Fixture $fixture): int
    {
        if ($this->option('show-instructions')) {
            $this->line('OpenAI instructions:');
            $this->line($this->promptBuilder->instructions());
            $this->newLine();
        }

        $this->line('OpenAI input:');
        $this->line($this->promptBuilder->context($fixture));

        return self::SUCCESS;
    }

    private function showStoredPrediction(Fixture $fixture, Prediction $prediction): void
    {
        $this->info("AI prediction opgeslagen voor fixture {$fixture->id}.");
        $this->line("Home: {$prediction->home_chance}%");
        $this->line("Draw: {$prediction->draw_chance}%");
        $this->line("Away: {$prediction->away_chance}%");
        $this->line("Confidence: {$prediction->confidence}%");

        if ($prediction->home_goals !== null && $prediction->away_goals !== null) {
            $this->line("Expected score: {$prediction->home_goals}-{$prediction->away_goals}");
        }
    }
}
