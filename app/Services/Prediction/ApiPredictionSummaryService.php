<?php

namespace App\Services\Prediction;

use App\Models\Prediction;

class ApiPredictionSummaryService
{
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
            '- API advice: '.$this->formatPromptValue($summary['api_advice']),
            '- API home chance: '.$this->formatPercentage($summary['api_home_chance']),
            '- API draw chance: '.$this->formatPercentage($summary['api_draw_chance']),
            '- API away chance: '.$this->formatPercentage($summary['api_away_chance']),
            '- API predicted outcome: '.$this->formatPromptValue($summary['api_predicted_outcome']),
            '- API goal trend: '.$this->formatPromptValue($summary['api_goal_trend']),
            '- API confidence: '.$this->formatPromptValue($summary['api_confidence']),
        ];

        if ($summary['api_total_goals_line'] !== null) {
            $lines[] = '- API total goals line: '.$this->formatNumber($summary['api_total_goals_line']);
        }

        if ($summary['api_home_goals_line'] !== null) {
            $lines[] = '- API home goals line: '.$this->formatNumber($summary['api_home_goals_line']);
        }

        if ($summary['api_away_goals_line'] !== null) {
            $lines[] = '- API away goals line: '.$this->formatNumber($summary['api_away_goals_line']);
        }

        return implode(PHP_EOL, $lines);
    }

    private function parseAdvice(?string $advice): array
    {
        if ($advice === null || trim($advice) === '') {
            return [
                'predicted_outcome' => null,
                'goal_trend' => null,
            ];
        }

        $advice = trim($advice);

        if (str_starts_with($advice, 'Combo Winner :')) {
            return $this->parseComboAdvice(substr($advice, strlen('Combo Winner :')), true);
        }

        if (str_starts_with($advice, 'Combo Double chance :')) {
            return $this->parseComboAdvice(substr($advice, strlen('Combo Double chance :')), false);
        }

        if (str_starts_with($advice, 'Winner :')) {
            $winner = trim(substr($advice, strlen('Winner :')));

            return [
                'predicted_outcome' => $winner === '' ? null : "{$winner} win",
                'goal_trend' => null,
            ];
        }

        if (str_starts_with($advice, 'Double chance :')) {
            $doubleChance = trim(substr($advice, strlen('Double chance :')));

            return [
                'predicted_outcome' => $doubleChance === '' ? null : $doubleChance,
                'goal_trend' => null,
            ];
        }

        return [
            'predicted_outcome' => null,
            'goal_trend' => null,
        ];
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

        return preg_replace('/\s+:\s+/', ': ', trim($advice));
    }

    private function formatPromptValue(mixed $value): string
    {
        if ($value === null || $value === '') {
            return 'not available';
        }

        return (string) $value;
    }

    private function formatPercentage(mixed $value): string
    {
        if ($value === null || $value === '') {
            return 'not available';
        }

        return $this->formatNumber($value).'%';
    }

    private function formatNumber(mixed $value): string
    {
        $formatted = number_format((float) $value, 2, '.', '');

        return rtrim(rtrim($formatted, '0'), '.');
    }
}
