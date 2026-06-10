<?php

namespace App\Console\Commands;

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use Illuminate\Console\Command;

class CleanDemoFriendliesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mondialiq:clean-friendlies {--force : Actually delete the records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up AI and API predictions for Friendly fixtures (Demo branch only).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Finding AI/API predictions for Friendly fixtures...');

        $query = Prediction::query()
            ->whereIn('source', [PredictionTypes::Ai, PredictionTypes::Api])
            ->whereHas('fixture', function ($q) {
                $q->whereHas('league', function ($leagueQuery) {
                    $leagueQuery->where('name', 'like', '%Friendly%')
                        ->orWhere('name', 'like', '%Friendlies%')
                        ->orWhere('type', 'Friendly');
                });
            });

        $count = $query->count();

        if ($count === 0) {
            $this->info('No AI/API predictions for Friendly fixtures found. Database is clean!');

            return self::SUCCESS;
        }

        $this->warn("Found {$count} AI/API prediction(s) linked to Friendly fixtures.");

        if (! $this->option('force')) {
            $this->info('This is a dry run. No records were deleted.');
            $this->info('Run the command with the --force flag to delete them:');
            $this->line('php artisan mondialiq:clean-friendlies --force');

            return self::SUCCESS;
        }

        $this->warn('Deleting records...');
        $deleted = $query->delete();

        $this->info("Successfully deleted {$deleted} AI/API prediction(s).");

        return self::SUCCESS;
    }
}
