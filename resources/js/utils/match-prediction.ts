import type { Match } from '@/types/match';

export function predictionScoreValue(score: number | null | undefined): string {
    return score === null || score === undefined ? '' : String(score);
}

export function hasMatchStarted(match: Match): boolean {
    return new Date(`${match.dateValue}T${match.time}:00`) <= new Date();
}
