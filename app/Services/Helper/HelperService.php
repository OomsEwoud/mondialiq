<?php

namespace App\Services\Helper;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class HelperService
{
    public function filterOptions(Builder $query): array
    {
        $fixtures = $query
            ->with(['homeTeam:id,name', 'awayTeam:id,name'])
            ->orderBy('match_date')
            ->get(['id', 'home_team_id', 'away_team_id', 'round_name', 'match_date']);

        return [
            'rounds' => $this->roundOptions($fixtures),
            'dates' => $this->dateOptions($fixtures),
            'teams' => $this->teamOptions($fixtures),
        ];
    }

    public function roundSlug(string $roundName): string
    {
        $normalized = preg_replace('/\s-\s(?=\d)/', ' round ', $roundName) ?? $roundName;

        return Str::slug($normalized);
    }

    public function roundNameFromSlug(array $rounds, string $slug): string
    {
        if ($slug === '') {
            return '';
        }

        $round = collect($rounds)->firstWhere('value', $slug);

        return is_array($round) ? $round['label'] ?? '' : '';
    }

    private function roundOptions(Collection $fixtures): Collection
    {
        return $fixtures
            ->pluck('round_name')
            ->filter(fn (mixed $roundName): bool => is_string($roundName) && $roundName !== '')
            ->unique()
            ->values()
            ->map(fn (string $roundName) => [
                'label' => $roundName,
                'value' => $this->roundSlug($roundName),
            ])
            ->values();
    }

    private function dateOptions(Collection $fixtures): Collection
    {
        return $fixtures
            ->filter(fn (Fixture $fixture): bool => $fixture->match_date !== null)
            ->map(fn (Fixture $fixture) => [
                'label' => $fixture->match_date->format('d M'),
                'value' => $fixture->match_date->format('Y-m-d'),
            ])
            ->unique('value')
            ->values();
    }

    private function teamOptions(Collection $fixtures): Collection
    {
        return $fixtures
            ->flatMap(fn (Fixture $fixture) => [
                $fixture->homeTeam?->name,
                $fixture->awayTeam?->name,
            ])
            ->filter(fn (mixed $teamName): bool => is_string($teamName) && $teamName !== '')
            ->unique()
            ->sort()
            ->values();
    }
}
