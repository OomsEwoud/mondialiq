import type { Match } from '@/types/match';
import type {
    ConfidenceSort,
    OutcomeFilter,
    PointsStateFilter,
    PredictionFilterMode,
    PredictionFilters,
    PredictionStatusFilter,
} from '@/types/prediction-filter';
import { getMatchStatusKind } from '@/utils/match-status';

export const defaultPredictionFilters: PredictionFilters = {
    search: '',
    date: '',
    status: 'all',
    outcome: 'all',
    pointsState: 'all',
    confidenceSort: 'default',
};

export function hasActivePredictionFilters(
    filters: PredictionFilters,
): boolean {
    return (
        filters.search.trim().length > 0 ||
        filters.date.trim().length > 0 ||
        filters.status !== 'all' ||
        filters.outcome !== 'all' ||
        filters.pointsState !== 'all' ||
        filters.confidenceSort !== 'default'
    );
}

export function matchesSearch(match: Match, search: string): boolean {
    const query = search.trim().toLowerCase();

    if (!query) {
        return true;
    }

    const searchable = [
        match.homeTeam,
        match.awayTeam,
        match.homeTeamShort,
        match.awayTeamShort,
        match.round,
        `${match.homeTeam} ${match.awayTeam}`,
        `${match.homeTeamShort} ${match.awayTeamShort}`,
    ];

    return searchable.some((value) => value.toLowerCase().includes(query));
}

export function getPredictionStatus(
    match: Match,
): Exclude<PredictionStatusFilter, 'all'> {
    const status = getMatchStatusKind(match);

    if (status === 'finished' || hasKickoffPassed(match)) {
        return 'past';
    }

    return 'upcoming';
}

export function matchesFilters(
    mode: PredictionFilterMode,
    match: Match,
    filters: PredictionFilters,
): boolean {
    return (
        matchesSearch(match, filters.search) &&
        matchesDateFilter(match, filters.date) &&
        matchesStatusFilter(match, filters.status) &&
        matchesOutcomeFilter(mode, match, filters.outcome) &&
        matchesPointsState(mode, match, filters.pointsState)
    );
}

function matchesDateFilter(match: Match, date: string): boolean {
    if (!date) {
        return true;
    }

    return match.dateValue === date;
}

export function sortByConfidence(
    mode: PredictionFilterMode,
    matches: Match[],
    sort: ConfidenceSort,
): Match[] {
    if (sort === 'default') {
        return matches;
    }

    return [...matches].sort((first, second) => {
        const firstConfidence = getConfidenceValue(mode, first);
        const secondConfidence = getConfidenceValue(mode, second);

        return sort === 'confidence-desc'
            ? secondConfidence - firstConfidence
            : firstConfidence - secondConfidence;
    });
}

function matchesStatusFilter(
    match: Match,
    filter: PredictionStatusFilter,
): boolean {
    if (filter === 'all') {
        return true;
    }

    return getPredictionStatus(match) === filter;
}

function matchesOutcomeFilter(
    mode: PredictionFilterMode,
    match: Match,
    filter: OutcomeFilter,
): boolean {
    if (filter === 'all') {
        return true;
    }

    const outcome =
        mode === 'ai'
            ? match.aiPrediction?.outcome
            : match.userPrediction?.outcome;

    return outcome === filter;
}

function matchesPointsState(
    mode: PredictionFilterMode,
    match: Match,
    filter: PointsStateFilter,
): boolean {
    if (filter === 'all') {
        return true;
    }

    const prediction = mode === 'ai'
        ? match.aiPrediction
        : match.userPrediction;

    if (!prediction) {
        return false;
    }

    if (filter === 'points-earned') {
        return (
            prediction.pointsAwarded &&
            (prediction.points ?? 0) > 0
        );
    }

    if (filter === 'no-points-earned') {
        return (
            prediction.pointsAwarded &&
            (prediction.points ?? 0) <= 0
        );
    }

    return !prediction.pointsAwarded;
}

function getConfidenceValue(mode: PredictionFilterMode, match: Match): number {
    const confidence =
        mode === 'ai'
            ? match.aiPrediction?.confidence
            : match.userPrediction?.confidence;

    if (!confidence) {
        return -1;
    }

    if (mode === 'mine' || mode === 'user') {
        return (
            {
                low: 1,
                medium: 2,
                high: 3,
            }[confidence] ?? -1
        );
    }

    const numericConfidence = Number(confidence);

    if (!Number.isNaN(numericConfidence)) {
        return numericConfidence;
    }

    const normalized = confidence.toLowerCase();

    if (normalized.includes('high')) {
        return 100;
    }

    if (normalized.includes('moderate') || normalized.includes('medium')) {
        return 50;
    }

    if (normalized.includes('low')) {
        return 10;
    }

    return -1;
}

function hasKickoffPassed(match: Match): boolean {
    const kickoff = new Date(match.kickoffAt);

    if (Number.isNaN(kickoff.getTime())) {
        return getMatchStatusKind(match) === 'finished';
    }

    return kickoff < new Date();
}
