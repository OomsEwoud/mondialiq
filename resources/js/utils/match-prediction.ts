import type { Match } from '@/types/match';
import type { UserPredictionFormData } from '@/types/match-prediction';

export function initialPredictionFormData(
    match: Match,
): UserPredictionFormData {
    return {
        outcome: match.userPrediction?.outcome ?? '',
        home_score: predictionScoreValue(match.userPrediction?.homeScore),
        away_score: predictionScoreValue(match.userPrediction?.awayScore),
        confidence: match.userPrediction?.confidence ?? '',
    };
}

export function predictionScoreValue(score: number | null | undefined): string {
    return score === null || score === undefined ? '' : String(score);
}

export function hasMatchStarted(match: Match): boolean {
    return new Date(`${match.dateValue}T${match.time}:00`) <= new Date();
}

export function predictionScoreLabel(match: Match): string | null {
    const homeScore = match.userPrediction?.homeScore;
    const awayScore = match.userPrediction?.awayScore;

    if (
        homeScore === null ||
        homeScore === undefined ||
        awayScore === null ||
        awayScore === undefined
    ) {
        return null;
    }

    return `${homeScore}-${awayScore}`;
}

export function aiPredictionScoreLabel(match: Match): string | null {
    const homeScore = match.aiPrediction?.homeScore;
    const awayScore = match.aiPrediction?.awayScore;

    if (
        homeScore === null ||
        homeScore === undefined ||
        awayScore === null ||
        awayScore === undefined
    ) {
        return null;
    }

    return `${homeScore} - ${awayScore}`;
}

export function normalizeScoreLabel(score: string | null): string | null {
    return score?.replace(':', ' - ') ?? null;
}
