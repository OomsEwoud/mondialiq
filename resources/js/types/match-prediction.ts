export type PredictionOutcome = 'home' | 'draw' | 'away';

export type PredictionConfidence = 'low' | 'medium' | 'high';

export type UserPredictionFormData = {
    outcome: PredictionOutcome | '';
    home_score: string;
    away_score: string;
    confidence: PredictionConfidence | '';
    scoreboard_id: string;
    is_boosted: boolean;
};
