export type PredictionFilterMode = 'ai' | 'mine' | 'user';
export type PredictionStatusFilter = 'all' | 'upcoming' | 'past';
export type OutcomeFilter = 'all' | 'home' | 'draw' | 'away';
export type PointsStateFilter =
    | 'all'
    | 'points-pending'
    | 'points-earned'
    | 'no-points-earned';
export type ConfidenceSort = 'default' | 'confidence-desc' | 'confidence-asc';

export interface PredictionFilters {
    search: string;
    date: string;
    status: PredictionStatusFilter;
    outcome: OutcomeFilter;
    pointsState: PointsStateFilter;
    confidenceSort: ConfidenceSort;
}

export interface PredictionFilterOption<TValue extends string> {
    label: string;
    value: TValue;
}
