<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Prediction\PredictionContextService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use JsonException;

#[Signature('app:show-prediction-context {fixture} {--json}')]
#[Description('Toon de prediction context voor een fixture')]
class ShowPredictionContext extends Command
{
    public function __construct(
        private readonly PredictionContextService $predictionContextService,
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

        if ($this->option('json')) {
            return $this->showJson($fixture);
        }

        $this->line($this->predictionContextService->promptBlock($fixture));

        return self::SUCCESS;
    }

    private function showJson(Fixture $fixture): int
    {
        try {
            $this->line(json_encode(
                $this->predictionContextService->summarize($fixture),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
            ));
        } catch (JsonException $exception) {
            $this->error("Prediction context kon niet als JSON getoond worden: {$exception->getMessage()}");

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
