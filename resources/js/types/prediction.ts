import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import type { Match } from '@/types/match';

export interface PredictionPageProps {
    fixtures: {
        data: Match[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    mode: PredictionTab;
    scoringGuideHref: string;
}

export interface PredictionShowPageProps {
    match: Match;
    mode: PredictionTab;
    aiContext: AiPredictionContext;
}

export interface AiPredictionContext {
    marketOdds: MarketOddsSummary;
    apiPrediction: ApiPredictionSummary | null;
}

export interface MarketOddsSummary {
    home_win_probability: number | null;
    draw_probability: number | null;
    away_win_probability: number | null;
    over_2_5_probability: number | null;
    under_2_5_probability: number | null;
    btts_yes_probability: number | null;
    btts_no_probability: number | null;
    most_likely_score: string | null;
}

export interface ApiPredictionSummary {
    api_advice: string | null;
    api_home_chance: number | null;
    api_draw_chance: number | null;
    api_away_chance: number | null;
    api_predicted_outcome: string | null;
    api_goal_trend: string | null;
    api_confidence: string | number | null;
    api_total_goals_line: number | null;
    api_home_goals_line: number | null;
    api_away_goals_line: number | null;
}
