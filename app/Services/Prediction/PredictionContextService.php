<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Prediction;

class PredictionContextService
{
    private const FIXTURE_RELATIONS = [
        'homeTeam:id,name',
        'awayTeam:id,name',
        'league:id,name',
        'venue:id,name,city',
    ];

    private const GUIDANCE_LINES = [
        'Market odds are the strongest external signal.',
        'API predictions are a secondary signal.',
        'Team stats, standings, head-to-head and missing players provide context.',
        'If sources disagree, explain the disagreement.',
    ];

    public function __construct(
        private readonly FixtureOddsSummaryService $oddsSummaryService,
        private readonly ApiPredictionSummaryService $apiPredictionSummaryService,
        private readonly TeamStatsSummaryService $teamStatsSummaryService,
        private readonly StandingsSummaryService $standingsSummaryService,
        private readonly HeadToHeadSummaryService $headToHeadSummaryService,
        private readonly MissingPlayersSummaryService $missingPlayersSummaryService,
        private readonly PromptFormatter $formatter,
    ) {}

    public function summarize(Fixture $fixture): array
    {
        $fixture->loadMissing([
            ...self::FIXTURE_RELATIONS,
            'apiPrediction',
        ]);

        return [
            'fixture' => $this->fixtureSummary($fixture),
            'market_odds' => $this->oddsSummaryService->summarize($fixture),
            'api_prediction' => $this->apiPredictionSummary($fixture->apiPrediction),
            'team_statistics' => $this->teamStatsSummaryService->summarize($fixture),
            'standings' => $this->standingsSummaryService->summarize($fixture),
            'head_to_head' => $this->headToHeadSummaryService->summarize($fixture),
            'missing_players' => $this->missingPlayersSummaryService->summarize($fixture),
            'guidance' => self::GUIDANCE_LINES,
        ];
    }

    public function promptBlock(Fixture $fixture, bool $includeGuidance = true): string
    {
        $fixture->loadMissing(['apiPrediction']);

        $sections = [
            'Prediction context:',
            $this->fixturePromptBlock($fixture),
            $this->oddsSummaryService->promptBlock($fixture),
            $this->apiPredictionPromptBlock($fixture->apiPrediction),
            $this->teamStatsSummaryService->promptBlock($fixture),
            $this->standingsSummaryService->promptBlock($fixture),
            $this->headToHeadSummaryService->promptBlock($fixture),
            $this->missingPlayersSummaryService->promptBlock($fixture),
        ];

        if ($includeGuidance) {
            $sections[] = $this->guidancePromptBlock();
        }

        return implode(PHP_EOL.PHP_EOL, $sections);
    }

    private function fixtureSummary(Fixture $fixture): array
    {
        return [
            'home_team' => $fixture->homeTeam?->name,
            'away_team' => $fixture->awayTeam?->name,
            'date' => $fixture->match_date?->toIso8601String(),
            'league' => $fixture->league?->name,
            'season' => $fixture->season,
            'round' => $fixture->round_name,
            'venue' => $fixture->venue?->name,
            'venue_city' => $fixture->venue?->city,
        ];
    }

    private function fixturePromptBlock(Fixture $fixture): string
    {
        $fixture->loadMissing(self::FIXTURE_RELATIONS);

        $lines = [
            'Fixture:',
            '- '.$this->fixtureTeamsLine($fixture),
            '- '.$this->fixtureLeagueLine($fixture),
            '- '.($fixture->round_name ?? 'Round not available'),
            '- '.$this->fixtureDateLine($fixture),
        ];

        if ($fixture->venue?->name !== null) {
            $lines[] = '- Venue: '.$this->fixtureVenueLine($fixture);
        }

        $venueContextLine = $this->venueContextLine($fixture);

        if ($venueContextLine !== null) {
            $lines[] = '- Venue context: '.$venueContextLine;
        }

        return implode(PHP_EOL, $lines);
    }

    private function apiPredictionSummary(?Prediction $prediction): ?array
    {
        if ($prediction === null) {
            return null;
        }

        return $this->apiPredictionSummaryService->summarize($prediction);
    }

    private function apiPredictionPromptBlock(?Prediction $prediction): string
    {
        if ($prediction === null) {
            return implode(PHP_EOL, [
                'API prediction summary:',
                '- API prediction data not available.',
            ]);
        }

        return $this->apiPredictionSummaryService->promptBlock($prediction);
    }

    private function guidancePromptBlock(): string
    {
        return implode(PHP_EOL, [
            'Guidance:',
            ...array_map(
                fn (string $line): string => "- {$line}",
                self::GUIDANCE_LINES,
            ),
        ]);
    }

    private function fixtureTeamsLine(Fixture $fixture): string
    {
        return sprintf(
            '%s vs %s',
            $this->formatter->teamName($fixture->homeTeam?->name, 'Home team'),
            $this->formatter->teamName($fixture->awayTeam?->name, 'Away team'),
        );
    }

    private function fixtureLeagueLine(Fixture $fixture): string
    {
        return trim(($fixture->league?->name ?? 'League not available').' '.($fixture->season ?? ''));
    }

    private function fixtureDateLine(Fixture $fixture): string
    {
        if ($fixture->match_date === null) {
            return 'Date not available';
        }

        return $fixture->match_date
            ->timezone(config('app.timezone'))
            ->format('d M H:i');
    }

    private function fixtureVenueLine(Fixture $fixture): string
    {
        if ($fixture->venue?->city === null) {
            return $fixture->venue->name;
        }

        return "{$fixture->venue->name}, {$fixture->venue->city}";
    }

    private function venueContextLine(Fixture $fixture): ?string
    {
        $round = mb_strtolower($fixture->round_name ?? '');
        $league = mb_strtolower($fixture->league?->name ?? '');

        if (str_contains($round, 'final')) {
            return 'Likely neutral venue; do not treat the listed home team as having home advantage.';
        }

        if (str_contains($league, 'world cup')) {
            return 'Home advantage should only apply to host nations, not automatically to the listed home team.';
        }

        return null;
    }
}
