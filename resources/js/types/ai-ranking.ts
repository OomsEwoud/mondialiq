export type PredictionType = 'all' | 'outcome' | 'exact' | 'double_chance';
export type ConfidenceLevel = 'all' | 'high' | 'medium' | 'low' | 'unknown';

export interface PerformanceMetrics {
    predictionCount: number;
    evaluatedCount: number;
    correctCount: number;
    outcomeEvaluatedCount: number;
    outcomeCorrectCount: number;
    exactCount: number;
    exactEligibleCount: number;
    accuracy: number | null;
    outcomeAccuracy: number | null;
    exactAccuracy: number | null;
}

export interface PerformanceFilters {
    competition: number | null;
    team: number | null;
    period: 'all' | '7d' | '30d' | '90d' | '365d';
    predictionType: PredictionType;
    confidence: ConfidenceLevel;
}

export interface PerformanceGroup extends PerformanceMetrics {
    id: number | string;
    name: string;
}

export interface RecentPrediction {
    id: number;
    fixtureId: number;
    homeTeam: string;
    awayTeam: string;
    competition: string;
    kickoffAt: string;
    outcome: string | null;
    predictedScore: string | null;
    actualScore: string;
    correct: boolean;
    exactCorrect: boolean | null;
    confidence: number | null;
}

export interface AiPerformancePageProps {
    summary: PerformanceMetrics;
    periodPerformance: {
        days: number;
        current: PerformanceMetrics;
        previous: PerformanceMetrics;
        change: number | null;
    }[];
    dailyPerformance: (PerformanceMetrics & { date: string })[];
    competitionPerformance: (PerformanceMetrics & {
        id: number;
        name: string;
    })[];
    teamPerformance: (PerformanceMetrics & { id: number; name: string })[];
    typePerformance: PerformanceGroup[];
    confidencePerformance: PerformanceGroup[];
    recentPredictions: RecentPrediction[];
    competitionOptions: { id: number; name: string }[];
    teamOptions: { id: number; name: string }[];
    filters: PerformanceFilters;
}
