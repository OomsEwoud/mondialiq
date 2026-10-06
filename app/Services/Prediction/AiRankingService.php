<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use stdClass;

class AiRankingService
{
    private const PERIOD_DAYS = ['7d' => 7, '30d' => 30, '90d' => 90, '365d' => 365];

    private const TYPE_LABELS = ['outcome' => 'Wedstrijduitkomst (1X2)', 'exact' => 'Exacte score', 'double_chance' => 'Dubbele kans'];

    private const CONFIDENCE_LABELS = ['high' => 'Hoog · 75–100%', 'medium' => 'Gemiddeld · 50–<75%', 'low' => 'Laag · onder 50%', 'unknown' => 'Niet vastgelegd'];

    public function __construct(
        private readonly ConnectionInterface $database,
        private readonly AiPredictionOutcomeHelper $outcomeHelper,
    ) {}

    /** @param array{competition: ?int, team: ?int, period: string, predictionType: string, confidence: string} $filters */
    public function overview(array $filters): array
    {
        $now = CarbonImmutable::now('UTC');
        $cutoff = $filters['period'] === 'all' ? null : $now->subDays(self::PERIOD_DAYS[$filters['period']]);
        $summary = $this->emptyStats();
        $competitions = $teams = $confidenceGroups = $types = [];
        $periods = [7 => ['current' => $this->emptyStats(), 'previous' => $this->emptyStats()], 30 => ['current' => $this->emptyStats(), 'previous' => $this->emptyStats()]];
        $daily = $recentPredictions = [];
        for ($day = 29; $day >= 0; $day--) {
            $daily[$now->setTimezone('Europe/Brussels')->subDays($day)->toDateString()] = $this->emptyStats();
        }

        foreach ($this->predictions($filters, $now, $cutoff)->cursor() as $prediction) {
            $date = CarbonImmutable::parse($prediction->match_date, 'Europe/Brussels')->utc();
            $outcome = $this->outcome($prediction);
            $hasScore = $this->hasScore($prediction);
            $type = $outcome === null ? null : (str_contains($outcome, '_or_') ? 'double_chance' : 'outcome');
            $confidence = $this->confidenceGroup($prediction->confidence);
            $result = $this->result($prediction, $outcome, $hasScore);
            $inPeriod = $cutoff === null || $date->greaterThanOrEqualTo($cutoff);
            $matchesType = $filters['predictionType'] === 'all' || $filters['predictionType'] === $type || ($filters['predictionType'] === 'exact' && $hasScore);
            $matchesConfidence = $filters['confidence'] === 'all' || $filters['confidence'] === $confidence;

            if ($inPeriod && $matchesConfidence) {
                if ($type !== null) {
                    $types[$type] ??= $this->emptyStats();
                    $this->add($types[$type], $result, $type);
                }
                if ($hasScore) {
                    $types['exact'] ??= $this->emptyStats();
                    $this->add($types['exact'], $result, 'exact');
                }
            }
            if ($inPeriod && $matchesType) {
                $confidenceGroups[$confidence] ??= $this->emptyStats();
                $this->add($confidenceGroups[$confidence], $result, $filters['predictionType']);
            }
            if (! $matchesType || ! $matchesConfidence) {
                continue;
            }

            foreach ([7, 30] as $days) {
                if ($date->greaterThanOrEqualTo($now->subDays($days))) {
                    $this->add($periods[$days]['current'], $result, $filters['predictionType']);
                } elseif ($date->greaterThanOrEqualTo($now->subDays($days * 2))) {
                    $this->add($periods[$days]['previous'], $result, $filters['predictionType']);
                }
            }
            $dayKey = $date->setTimezone('Europe/Brussels')->toDateString();
            if (isset($daily[$dayKey])) {
                $this->add($daily[$dayKey], $result, $filters['predictionType']);
            }
            if (! $inPeriod) {
                continue;
            }

            $this->add($summary, $result, $filters['predictionType']);
            $competitions[$prediction->league_id] ??= $this->emptyStats();
            $this->add($competitions[$prediction->league_id], $result, $filters['predictionType']);
            foreach (array_unique([$prediction->home_team_id, $prediction->away_team_id]) as $teamId) {
                $teams[$teamId] ??= $this->emptyStats();
                $this->add($teams[$teamId], $result, $filters['predictionType']);
            }
            $correct = $this->selectedResult($result, $filters['predictionType']);
            if ($correct !== null) {
                $recentPredictions[] = [
                    'id' => $prediction->id, 'fixtureId' => $prediction->fixture_id,
                    'homeTeam' => $prediction->home_team_name, 'awayTeam' => $prediction->away_team_name,
                    'competition' => $prediction->league_name, 'kickoffAt' => $date->toIso8601String(),
                    'outcome' => $outcome, 'predictedScore' => $hasScore ? (int) $prediction->home_goals.'–'.(int) $prediction->away_goals : null,
                    'actualScore' => $prediction->fulltime_home_goals.'–'.$prediction->fulltime_away_goals,
                    'correct' => $correct, 'exactCorrect' => $result['exact'],
                    'confidence' => $prediction->confidence !== null ? (float) $prediction->confidence : null,
                ];
                $recentPredictions = array_slice($recentPredictions, -12);
            }
        }

        $leagueOptions = League::query()->orderBy('name')->get(['id', 'name']);
        $teamOptions = Team::query()->whereIn('id', function ($query) {
            $query->select('home_team_id')->from('fixtures')->union($this->database->table('fixtures')->select('away_team_id'));
        })->orderBy('name')->get(['id', 'name']);

        return [
            'summary' => $this->metrics($summary),
            'periodPerformance' => collect($periods)->map(fn (array $stats, int $days): array => [
                'days' => $days, 'current' => $this->metrics($stats['current']), 'previous' => $this->metrics($stats['previous']),
                'change' => $this->change($stats['current'], $stats['previous']),
            ])->values(),
            'dailyPerformance' => collect($daily)->map(fn (array $stats, string $date): array => ['date' => $date, ...$this->metrics($stats)])->values(),
            'competitionPerformance' => $this->namedMetrics($competitions, $leagueOptions),
            'teamPerformance' => $this->namedMetrics($teams, $teamOptions),
            'typePerformance' => $this->labelledMetrics($types, self::TYPE_LABELS),
            'confidencePerformance' => $this->labelledMetrics($confidenceGroups, self::CONFIDENCE_LABELS),
            'recentPredictions' => array_reverse($recentPredictions),
            'competitionOptions' => $leagueOptions, 'teamOptions' => $teamOptions, 'filters' => $filters,
        ];
    }

    private function predictions(array $filters, CarbonImmutable $now, ?CarbonImmutable $cutoff): Builder
    {
        $trendStart = $now->subDays(60)->min($now->setTimezone('Europe/Brussels')->subDays(29)->startOfDay()->utc());
        $scanStart = $cutoff?->min($trendStart);

        return $this->database->table('predictions')
            ->join('fixtures', 'fixtures.id', '=', 'predictions.fixture_id')
            ->join('teams as home_team', 'home_team.id', '=', 'fixtures.home_team_id')
            ->join('teams as away_team', 'away_team.id', '=', 'fixtures.away_team_id')
            ->join('leagues', 'leagues.id', '=', 'fixtures.league_id')
            ->where('predictions.source', PredictionTypes::Ai->value)
            ->whereNotExists(fn ($query) => $query->selectRaw('1')->from('predictions as newer')
                ->whereColumn('newer.fixture_id', 'predictions.fixture_id')
                ->whereColumn('newer.id', '>', 'predictions.id')
                ->where('newer.source', PredictionTypes::Ai->value)
                ->where(fn ($query) => $query->whereNull('newer.visibility')->orWhere('newer.visibility', 'public')))
            ->where(fn ($query) => $query->whereNull('predictions.visibility')->orWhere('predictions.visibility', 'public'))
            ->where('fixtures.match_date', '<=', $now->setTimezone('Europe/Brussels')->toDateTimeString())
            ->when($scanStart !== null, fn ($query) => $query->where('fixtures.match_date', '>=', $scanStart->setTimezone('Europe/Brussels')->toDateTimeString()))
            ->when($filters['competition'], fn ($query) => $query->where('fixtures.league_id', $filters['competition']))
            ->when($filters['team'], fn ($query) => $query->where(fn ($query) => $query->where('fixtures.home_team_id', $filters['team'])->orWhere('fixtures.away_team_id', $filters['team'])))
            ->select([
                'predictions.id', 'predictions.fixture_id', 'predictions.winner_id', 'predictions.home_goals', 'predictions.away_goals',
                'predictions.advice', 'predictions.confidence', 'predictions.created_at',
                'fixtures.league_id', 'fixtures.match_date', 'fixtures.status_short', 'fixtures.status_long',
                'fixtures.home_team_id', 'fixtures.away_team_id', 'fixtures.fulltime_home_goals', 'fixtures.fulltime_away_goals',
                'home_team.name as home_team_name', 'away_team.name as away_team_name', 'leagues.name as league_name',
            ])->orderBy('fixtures.match_date')->orderBy('predictions.id');
    }

    private function outcome(stdClass $prediction): ?string
    {
        if (preg_match('/AI outcome: (\w+)\./', $prediction->advice ?? '', $match)) {
            return $this->outcomeHelper->normalizeOutcome($match[1]);
        }
        if ($prediction->winner_id !== null) {
            return match ((int) $prediction->winner_id) {
                (int) $prediction->home_team_id => 'home', (int) $prediction->away_team_id => 'away', default => null,
            };
        }

        return $this->hasScore($prediction) ? $this->outcomeHelper->getOutcomeFromScore((int) $prediction->home_goals, (int) $prediction->away_goals) : null;
    }

    private function result(stdClass $prediction, ?string $outcome, bool $hasScore): ?array
    {
        $finished = in_array($prediction->status_short, Fixture::FINISHED_STATUS_SHORTS, true) || str_contains($prediction->status_long ?? '', 'Finished');
        if (! $finished || $prediction->fulltime_home_goals === null || $prediction->fulltime_away_goals === null
            || $prediction->created_at === null
            || CarbonImmutable::parse($prediction->created_at, 'UTC')->greaterThanOrEqualTo(CarbonImmutable::parse($prediction->match_date, 'Europe/Brussels'))) {
            return null;
        }

        return [
            'outcome' => $outcome !== null ? $this->outcomeHelper->isOutcomeCompatibleWithScore($outcome, (int) $prediction->fulltime_home_goals, (int) $prediction->fulltime_away_goals) : null,
            'exact' => $hasScore ? (int) $prediction->home_goals === (int) $prediction->fulltime_home_goals && (int) $prediction->away_goals === (int) $prediction->fulltime_away_goals : null,
        ];
    }

    private function hasScore(stdClass $prediction): bool
    {
        foreach ([$prediction->home_goals, $prediction->away_goals] as $score) {
            if (! is_numeric($score) || (float) $score < 0 || floor((float) $score) !== (float) $score) {
                return false;
            }
        }

        return true;
    }

    private function confidenceGroup(mixed $confidence): string
    {
        return match (true) {
            $confidence === null => 'unknown', (float) $confidence >= 75 => 'high', (float) $confidence >= 50 => 'medium', default => 'low',
        };
    }

    private function emptyStats(): array
    {
        return ['predictionCount' => 0, 'evaluatedCount' => 0, 'correctCount' => 0, 'outcomeEvaluatedCount' => 0, 'outcomeCorrectCount' => 0,
            'exactEligibleCount' => 0, 'exactCount' => 0];
    }

    private function selectedResult(?array $result, string $type): ?bool
    {
        return $result === null ? null : $result[$type === 'exact' ? 'exact' : 'outcome'];
    }

    private function add(array &$stats, ?array $result, string $type): void
    {
        $stats['predictionCount']++;
        $correct = $this->selectedResult($result, $type);
        if ($correct !== null) {
            $stats['evaluatedCount']++;
            $stats['correctCount'] += (int) $correct;
        }
        foreach (['outcome' => ['outcomeEvaluatedCount', 'outcomeCorrectCount'], 'exact' => ['exactEligibleCount', 'exactCount']] as $key => [$total, $correctKey]) {
            if (($result[$key] ?? null) !== null) {
                $stats[$total]++;
                $stats[$correctKey] += (int) $result[$key];
            }
        }
    }

    private function metrics(array $stats): array
    {
        return [...$stats, 'accuracy' => $this->rate($stats['correctCount'], $stats['evaluatedCount']),
            'outcomeAccuracy' => $this->rate($stats['outcomeCorrectCount'], $stats['outcomeEvaluatedCount']),
            'exactAccuracy' => $this->rate($stats['exactCount'], $stats['exactEligibleCount'])];
    }

    private function namedMetrics(array $groups, Collection $options): Collection
    {
        return $options->filter(fn ($option): bool => isset($groups[$option->id]))
            ->map(fn ($option): array => ['id' => $option->id, 'name' => $option->name, ...$this->metrics($groups[$option->id])])
            ->sort(fn (array $first, array $second): int => ($second['accuracy'] ?? -1) <=> ($first['accuracy'] ?? -1)
                ?: $second['evaluatedCount'] <=> $first['evaluatedCount'] ?: strcmp($first['name'], $second['name']))->values();
    }

    private function labelledMetrics(array $groups, array $labels): array
    {
        return collect($labels)->map(fn (string $label, string $id): array => ['id' => $id, 'name' => $label, ...$this->metrics($groups[$id] ?? $this->emptyStats())])->values()->all();
    }

    private function change(array $current, array $previous): ?float
    {
        $currentRate = $this->rate($current['correctCount'], $current['evaluatedCount']);
        $previousRate = $this->rate($previous['correctCount'], $previous['evaluatedCount']);

        return $currentRate !== null && $previousRate !== null ? round($currentRate - $previousRate, 1) : null;
    }

    private function rate(int $correct, int $total): ?float
    {
        return $total > 0 ? round($correct / $total * 100, 1) : null;
    }
}
