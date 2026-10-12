<?php

namespace App\Services\Football;

use Illuminate\Database\Eloquent\Builder;
use InvalidArgumentException;

final readonly class CompetitionConfig
{
    public function __construct(public int $leagueId, public int $season)
    {
        if ($leagueId <= 0 || $season < 1900 || $season > 2100) {
            throw new InvalidArgumentException('API Football league_id of season is niet correct geconfigureerd. Verwacht een positief league-ID en seizoen 1900–2100.');
        }
    }

    /** @return list<self> */
    public static function configured(): array
    {
        $value = config('api-football.competitions');
        if ($value === null || $value === '') {
            return [new self((int) config('services.api_football.league_id'), (int) config('services.api_football.season'))];
        }
        if (! is_string($value)) {
            throw new InvalidArgumentException('API_FOOTBALL_COMPETITIONS moet league:season-paren bevatten.');
        }
        $competitions = [];
        foreach (explode(',', $value) as $pair) {
            if (! preg_match('/^([1-9][0-9]*):([0-9]{4})$/D', trim($pair), $matches)) {
                throw new InvalidArgumentException('Ongeldige API_FOOTBALL_COMPETITIONS: gebruik bijvoorbeeld 39:2026,140:2025.');
            }
            $competition = new self((int) $matches[1], (int) $matches[2]);
            $competitions[$competition->key()] = $competition;
        }

        return array_values($competitions);
    }

    public function key(): string
    {
        return $this->leagueId.':'.$this->season;
    }

    public function constrain(Builder $query): Builder
    {
        return $query->where('season', $this->season)
            ->whereHas('league', fn (Builder $league) => $league->where('external_id', $this->leagueId));
    }
}
