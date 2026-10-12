<?php

namespace App\Console\Commands\Concerns;

use App\Services\Football\CompetitionConfig;
use InvalidArgumentException;

trait InteractsWithFootballApiConfig
{
    protected function footballApiConfig(): ?array
    {
        try {
            $competition = CompetitionConfig::configured()[0];
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());

            return null;
        }

        return [
            'leagueId' => $competition->leagueId,
            'season' => $competition->season,
        ];
    }

    protected function forEachFootballCompetition(callable $callback): int
    {
        try {
            $competitions = CompetitionConfig::configured();
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
        foreach ($competitions as $competition) {
            $exit = $callback(['leagueId' => $competition->leagueId, 'season' => $competition->season]);
            if ($exit !== self::SUCCESS) {
                return $exit;
            }
        }

        return self::SUCCESS;
    }
}
