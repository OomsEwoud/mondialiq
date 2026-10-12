<?php

namespace App\Console\Commands;

use App\Models\League;
use App\Services\Apis\FootballApiBudget;
use App\Services\Football\CompetitionConfig;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use InvalidArgumentException;

#[Signature('football:api-status')]
#[Description('Toon gecachte quota en API-verbruik zonder API-request')]
class FootballApiStatus extends Command
{
    public function handle(FootballApiBudget $budget): int
    {
        try {
            $pairs = CompetitionConfig::configured();
            $status = $budget->status();
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
        $quota = $budget->quota();
        $this->info('API-Football — '.$status);
        $this->table(['Gegeven', 'Laatste waarneming'], [
            ['Daglimiet', $quota?->dailyLimit ?? 'onbekend'],
            ['Dag resterend', $quota?->dailyRemaining ?? 'onbekend'],
            ['Dag gebruikt', $quota?->dailyLimit !== null && $quota->dailyRemaining !== null ? max(0, $quota->dailyLimit - $quota->dailyRemaining) : 'onbekend'],
            ['Gebruik', $quota?->remainingPercent() !== null ? number_format(100 - $quota->remainingPercent(), 1).'%' : 'onbekend'],
            ['Minuutlimiet', $quota?->minuteLimit ?? 'onbekend'],
            ['Minuut resterend', $quota?->minuteRemaining ?? 'onbekend'],
            ['Gemeten op (UTC)', $quota?->lastUpdatedAt->toIso8601String() ?? 'nog niet gemeten'],
            ['Ouderdom', $quota ? (int) $quota->lastUpdatedAt->diffInSeconds(now('UTC')).' seconden' : 'onbekend'],
        ]);
        $names = League::query()->whereIn('external_id', array_map(fn (CompetitionConfig $pair): int => $pair->leagueId, $pairs))->pluck('name', 'external_id');
        $this->table(['Competitie', 'League ID', 'Season'], array_map(fn (CompetitionConfig $pair): array => [$names[$pair->leagueId] ?? 'Nog niet geïmporteerd', $pair->leagueId, $pair->season], $pairs));
        $usage = [];
        foreach ($budget->usage() as $endpoint => $callers) {
            foreach ($callers as $caller => $count) {
                $usage[] = [$endpoint, $caller, $count];
            }
        }
        $this->table(['Endpoint (vandaag UTC)', 'Command/job', 'Werkelijke calls'], $usage);
        $this->line('Quota is een laatste waarneming; het beleid houdt ook rekening met lokaal gereserveerde calls. Cacheflush wist deze tijdelijke metrics.');

        return self::SUCCESS;
    }
}
