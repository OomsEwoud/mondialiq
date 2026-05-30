<?php

namespace App\Services\Prediction;

use App\Models\Prediction;

class ApiPredictionSummaryService
{
    private const PREFIX_COMBO_WINNER = 'Combo Winner :';
    private const PREFIX_COMBO_DOUBLE_CHANCE = 'Combo Double chance :';
    private const PREFIX_WINNER = 'Winner :';
    private const PREFIX_DOUBLE_CHANCE = 'Double chance :';

    public function __construct(
        private readonly PromptFormatter $formatter,
    ) {
    }

    public function summarize(Prediction $prediction): array
    {
        $adviceSummary = $this->parseAdvice($prediction->advice);

        return [
            'api_advice' => $this->normalizeAdvice($prediction->advice),
            'api_home_chance' => $prediction->home_chance,
            'api_draw_chance' => $prediction->draw_chance,
            'api_away_chance' => $prediction->away_chance,
            'api_predicted_outcome' => $adviceSummary['predicted_outcome'],
            'api_goal_trend' => $adviceSummary['goal_trend'],
            'api_confidence' => $prediction->confidence,
            'api_total_goals_line' => $prediction->total_goals,
            'api_home_goals_line' => $prediction->home_goals,
            'api_away_goals_line' => $prediction->away_goals,
            'api_goal_line' => $prediction->total_goals,
            'api_home_goal_line' => $prediction->home_goals,
            'api_away_goal_line' => $prediction->away_goals,
        ];
    }

    public function promptBlock(Prediction $prediction): string
    {
        $summary = $this->summarize($prediction);
        $lines = [
            'API prediction summary:',
            '- API advice: '.$this->formatter->value($summary['api_advice']),
            '- API home chance: '.$this->formatter->percentage($summary['api_home_chance']),
            '- API draw chance: '.$this->formatter->percentage($summary['api_draw_chance']),
            '- API away chance: '.$this->formatter->percentage($summary['api_away_chance']),
            '- API predicted outcome: '.$this->formatter->value($summary['api_predicted_outcome']),
            '- API goal trend: '.$this->formatter->value($summary['api_goal_trend']),
            '- API confidence: '.$this->formatter->value($summary['api_confidence']),
        ];

        if ($summary['api_total_goals_line'] !== null) {
            $lines[] = '- API total goals line: '.$this->formatter->number($summary['api_total_goals_line']);
        }

        if ($summary['api_home_goals_line'] !== null) {
            $lines[] = '- API home goals line: '.$this->formatter->number($summary['api_home_goals_line']);
        }

        if ($summary['api_away_goals_line'] !== null) {
            $lines[] = '- API away goals line: '.$this->formatter->number($summary['api_away_goals_line']);
        }

        return implode(PHP_EOL, $lines);
    }

    private function parseAdvice(?string $advice): array
    {
        if ($advice === null || trim($advice) === '') {
            return $this->emptyAdviceSummary();
        }

        $advice = trim($advice);

        if (($comboWinnerAdvice = $this->afterPrefix($advice, self::PREFIX_COMBO_WINNER)) !== null) {
            return $this->parseComboAdvice($comboWinnerAdvice, true);
        }

        if (($comboDoubleChanceAdvice = $this->afterPrefix($advice, self::PREFIX_COMBO_DOUBLE_CHANCE)) !== null) {
            return $this->parseComboAdvice($comboDoubleChanceAdvice, false);
        }

        if (($winner = $this->afterPrefix($advice, self::PREFIX_WINNER)) !== null) {
            return $this->outcomeAdviceSummary(trim($winner), suffix: ' win');
        }

        if (($doubleChance = $this->afterPrefix($advice, self::PREFIX_DOUBLE_CHANCE)) !== null) {
            return $this->outcomeAdviceSummary(trim($doubleChance));
        }

        return $this->emptyAdviceSummary();
    }

    private function emptyAdviceSummary(): array
    {
        return [
            'predicted_outcome' => null,
            'goal_trend' => null,
        ];
    }

    private function outcomeAdviceSummary(string $outcome, string $suffix = ''): array
    {
        return [
            'predicted_outcome' => $outcome === '' ? null : "{$outcome}{$suffix}",
            'goal_trend' => null,
        ];
    }

    private function afterPrefix(string $value, string $prefix): ?string
    {
        if (! str_starts_with($value, $prefix)) {
            return null;
        }

        return substr($value, strlen($prefix));
    }

    private function parseComboAdvice(string $advice, bool $isWinner): array
    {
        $outcome = trim($advice);
        $goalTrend = null;

        if (preg_match('/^(.*?)\s+and\s+([+-]\d+(?:\.\d+)?)\s*goals?$/', $outcome, $matches) === 1) {
            $outcome = trim($matches[1]);
            $goalTrend = $this->goalTrendFromLine($matches[2]);
        }

        return [
            'predicted_outcome' => $outcome === '' ? null : ($isWinner ? "{$outcome} win" : $outcome),
            'goal_trend' => $goalTrend,
        ];
    }

    private function goalTrendFromLine(string $goalLine): ?string
    {
        $direction = $goalLine[0] ?? null;
        $line = ltrim($goalLine, '+-');

        return match ($direction) {
            '+' => "over {$line}",
            '-' => "under {$line}",
            default => null,
        };
    }

    private function normalizeAdvice(?string $advice): ?string
    {
        if ($advice === null || trim($advice) === '') {
            return null;
        }

        return preg_replace('/\s+:\s+/', ': ', trim($advice)) ?? trim($advice);
    }
}
