<?php

namespace App\Services\Helper;

use App\Models\Fixture;
use Illuminate\Support\Str;

class HelperService
{
    public function filterOptions(object $query): array
    {
        $fixtures = $query
            ->with(['homeTeam:id,name', 'awayTeam:id,name'])
            ->orderBy('match_date')
            ->get(['id', 'home_team_id', 'away_team_id', 'round_name', 'match_date']);

        return [
            'rounds' => $fixtures
                ->pluck('round_name')
                ->unique()
                ->values()
                ->map(fn(string $roundName) => [
                    'label' => $roundName,
                    'value' => $this->roundSlug($roundName),
                ])
                ->values(),
            'dates' => $fixtures
                ->map(fn(Fixture $fixture) => [
                    'label' => $fixture->match_date->format('d M'),
                    'value' => $fixture->match_date->format('Y-m-d'),
                ])
                ->unique('value')
                ->values(),
            'teams' => $fixtures
                ->flatMap(fn(Fixture $fixture) => [
                    $fixture->homeTeam->name,
                    $fixture->awayTeam->name,
                ])
                ->unique()
                ->sort()
                ->values(),
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

        return collect($rounds)->firstWhere('value', $slug)['label'] ?? '';
    }
}
