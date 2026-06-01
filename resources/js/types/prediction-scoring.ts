export type MatchOutcome = 'home' | 'draw' | 'away';

export interface PredictionScoreInput {
    predictedHomeScore: number;
    predictedAwayScore: number;
    actualHomeScore: number;
    actualAwayScore: number;
}

export interface PredictionScoreItem {
    label: string;
    description: string;
    points: number;
    earned: boolean;
}

export interface PredictionScoreBreakdown {
    exactScore: boolean;
    correctOutcome: boolean;
    correctGoalDifference: boolean;
    correctHomeGoals: boolean;
    correctAwayGoals: boolean;
    correctTotalGoals: boolean;
    total: number;
    items: PredictionScoreItem[];
}
