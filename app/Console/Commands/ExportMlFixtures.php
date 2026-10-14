<?php

namespace App\Console\Commands;

use App\Services\MachineLearning\FixtureDatasetExporter;
use DateTimeZone;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ml:export {--kickoff-timezone= : Verified timezone of stored match_date values}')]
#[Description('Export local fixture data read-only for the ML baseline')]
class ExportMlFixtures extends Command
{
    public function handle(FixtureDatasetExporter $exporter): int
    {
        $timezone = $this->option('kickoff-timezone');

        if (! is_string($timezone) || ! in_array($timezone, DateTimeZone::listIdentifiers(), true)) {
            $this->error('Geef een geldige --kickoff-timezone op na controle van de opgeslagen wedstrijddatums.');

            return self::FAILURE;
        }

        $path = $exporter->export($timezone);
        $this->info("ML-export opgeslagen: {$path}");

        return self::SUCCESS;
    }
}
