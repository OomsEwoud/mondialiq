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
    public function handle(PredictionContextService $predictionContextService): int
    {
        $fixtureId = (int) $this->argument('fixture');

        $fixture = $this->findFixture($fixtureId);

        if (! $fixture) {
            $this->error("Fixture {$fixtureId} niet gevonden.");

            return self::FAILURE;
        }

        if ($this->option('json')) {
            return $this->showJson($fixture, $predictionContextService);
        }

        $this->writeMultiline($predictionContextService->promptBlock($fixture));

        return self::SUCCESS;
    }

    private function findFixture(int $fixtureId): ?Fixture
    {
        return Fixture::query()->find($fixtureId);
    }

    private function showJson(Fixture $fixture, PredictionContextService $predictionContextService): int
    {
        try {
            $this->writeMultiline(json_encode(
                $predictionContextService->summarize($fixture),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
            ));
        } catch (JsonException $exception) {
            $this->error("Prediction context kon niet als JSON getoond worden: {$exception->getMessage()}");

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function writeMultiline(string $output): void
    {
        foreach (preg_split('/\R/', $output) ?: [$output] as $line) {
            $this->line($line);
        }
    }
}
