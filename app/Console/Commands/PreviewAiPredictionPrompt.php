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
    public function __construct(
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

        $this->line($this->promptBuilder->build($fixture));

        return self::SUCCESS;
    }
}
