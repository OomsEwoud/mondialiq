<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Prediction\AiPredictionPromptBuilder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:preview-ai-prediction-prompt {fixture}')]
#[Description('Toon lokaal de AI prediction prompt voor een fixture zonder externe API call')]
class PreviewAiPredictionPrompt extends Command
{
    public function handle(AiPredictionPromptBuilder $promptBuilder): int
    {
        $fixtureId = (int) $this->argument('fixture');

        $fixture = $this->findFixture($fixtureId);

        if (! $fixture) {
            $this->error("Fixture {$fixtureId} niet gevonden.");

            return self::FAILURE;
        }

        $this->writeMultiline($promptBuilder->build($fixture));

        return self::SUCCESS;
    }

    private function findFixture(int $fixtureId): ?Fixture
    {
        return Fixture::query()->find($fixtureId);
    }

    private function writeMultiline(string $output): void
    {
        foreach (preg_split('/\R/', $output) ?: [$output] as $line) {
            $this->line($line);
        }
    }
}
