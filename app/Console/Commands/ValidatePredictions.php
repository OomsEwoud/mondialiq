<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Prediction\UserPredictionScoringService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Signature('predictions:validate')]
#[Description('Valideer user predictions voor afgewerkte fixtures met finale scores')]
class ValidatePredictions extends Command
{
    public function __construct(
        private readonly UserPredictionScoringService $userPredictionScoringService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Valideren van user predictions voor afgewerkte fixtures');

        $fixtures = $this->finishedFixturesWithUnscoredPredictions();

        $this->info("{$fixtures->count()} afgewerkte fixtures met open predictions gevonden.");

        if ($fixtures->isEmpty()) {
            Log::info('Prediction validation finished without open predictions.');

            return self::SUCCESS;
        }

        $scored = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($fixtures as $fixture) {
            try {
                $result = $this->userPredictionScoringService->scoreFixture($fixture);

                $scored += $result['scored'];
                $skipped += $result['skipped'];

                if ($result['missing_final_score']) {
                    $this->warn("Fixture {$fixture->id} overgeslagen: finale score ontbreekt.");
                    Log::warning('Finished fixture has no final score for prediction validation.', [
                        'fixture_id' => $fixture->id,
                        'status_short' => $fixture->status_short,
                        'status_long' => $fixture->status_long,
                    ]);

                    continue;
                }

                $this->line("Fixture {$fixture->id}: {$result['scored']} predictions gevalideerd, {$result['skipped']} overgeslagen.");
            } catch (Throwable $exception) {
                $errors++;
                $this->error("Fout bij valideren van fixture {$fixture->id}: {$exception->getMessage()}");
                Log::error('Prediction validation failed for fixture.', [
                    'fixture_id' => $fixture->id,
                    'exception' => $exception,
                ]);
            }
        }

        $this->info("{$scored} predictions gevalideerd.");
        $this->info("{$skipped} predictions overgeslagen.");
        $this->info("{$errors} fouten.");

        Log::info('Prediction validation finished.', [
            'fixtures' => $fixtures->count(),
            'scored' => $scored,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function finishedFixturesWithUnscoredPredictions(): Collection
    {
        return Fixture::query()
            ->finished()
            ->whereHas('userPredictions', fn ($query) => $query->whereNull('points_awarded_at'))
            ->with(['userPredictions' => fn ($query) => $query->whereNull('points_awarded_at')])
            ->orderBy('match_date')
            ->get([
                'id',
                'status_short',
                'status_long',
                'match_date',
                'fulltime_home_goals',
                'fulltime_away_goals',
            ]);
    }
}
