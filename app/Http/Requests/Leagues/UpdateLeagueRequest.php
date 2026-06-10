<?php

namespace App\Http\Requests\Leagues;

use App\Http\Requests\Leagues\Concerns\ResolvesLeagueRoutes;
use App\Support\Leagues\LeagueBranding;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeagueRequest extends FormRequest
{
    use ResolvesLeagueRoutes;

    public function authorize(): bool
    {
        return $this->user()?->can('manage', $this->league()) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1000'],
            'reward_title' => ['nullable', 'string', 'max:120'],
            'reward_description' => ['nullable', 'string', 'max:1000'],
            'visibility' => ['required', 'string', 'in:private,public'],
            'is_active' => ['required', 'boolean'],
            'icon' => ['required', 'string', Rule::in(LeagueBranding::icons())],
            'accent_color' => ['required', 'string', Rule::in(LeagueBranding::accentColors())],
            'scoring_rules' => ['nullable', 'array'],
            'scoring_rules.exact_score_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.correct_result_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.correct_goal_difference_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.correct_home_goals_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.correct_away_goals_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.boosted_predictions_enabled' => ['required_with:scoring_rules', 'boolean'],
            'scoring_rules.boosted_predictions_limit' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:20'],
            'scoring_rules.boosted_confidence_threshold' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
            'scoring_rules.boosted_prediction_bonus_points' => ['required_with:scoring_rules', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function validatedScoringRules(): ?array
    {
        $rules = $this->validated('scoring_rules');

        if ($rules === null) {
            return null;
        }

        $result = [
            'exact_score_points' => (int) ($rules['exact_score_points'] ?? 10),
            'correct_result_points' => (int) ($rules['correct_result_points'] ?? 5),
            'correct_goal_difference_points' => (int) ($rules['correct_goal_difference_points'] ?? 3),
            'correct_home_goals_points' => (int) ($rules['correct_home_goals_points'] ?? 1),
            'correct_away_goals_points' => (int) ($rules['correct_away_goals_points'] ?? 1),
            'boosted_predictions_enabled' => (bool) ($rules['boosted_predictions_enabled'] ?? false),
            'boosted_predictions_limit' => (int) ($rules['boosted_predictions_limit'] ?? 3),
            'boosted_confidence_threshold' => (int) ($rules['boosted_confidence_threshold'] ?? 70),
            'boosted_prediction_bonus_points' => (int) ($rules['boosted_prediction_bonus_points'] ?? 2),
        ];

        return $result;
    }
}
