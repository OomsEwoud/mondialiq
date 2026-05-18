import type { Match } from '@/types/match';

export function predictionScoreValue(score: number | null | undefined): string {
    return score === null || score === undefined ? '' : String(score);
}

export function hasMatchStarted(match: Match): boolean {
    return new Date(`${match.dateValue}T${match.time}:00`) <= new Date();
}

export function predictionScoreLabel(match: Match): string | null {
    const homeScore = match.userPrediction?.homeScore;
    const awayScore = match.userPrediction?.awayScore;

    if (homeScore === null || awayScore === null) {
        return null;
    }

    return `${homeScore}-${awayScore}`;
}
