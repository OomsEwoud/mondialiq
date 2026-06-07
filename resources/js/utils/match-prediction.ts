import type { Match } from '@/types/match';
import type { UserPredictionFormData } from '@/types/match-prediction';

export function initialPredictionFormData(
    match: Match,
): UserPredictionFormData {
    return {
        outcome: match.userPrediction?.outcome ?? '',
        home_score: predictionScoreValue(match.userPrediction?.homeScore, '0'),
        away_score: predictionScoreValue(match.userPrediction?.awayScore, '0'),
        confidence: match.userPrediction?.confidence ?? '',
        scoreboard_id: '',
        is_boosted: false,
    };
}

export function predictionScoreValue(
    score: number | null | undefined,
    fallback = '0',
): string {
    return score === null || score === undefined ? fallback : String(score);
}

export function hasMatchStarted(match: Match): boolean {
    return isPredictionLocked(match);
}

export function canMakePrediction(match: Match): boolean {
    return !isPredictionLocked(match);
}

export function isPredictionLocked(match: Match): boolean {
    if (hasClosedMatchStatus(match.status)) {
        return true;
    }

    if (hasOpenMatchStatus(match.status)) {
        return hasKickoffPassed(match);
    }

    return hasKickoffPassed(match);
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

function hasKickoffPassed(match: Match): boolean {
    const kickoff = new Date(match.kickoffAt);

    if (Number.isNaN(kickoff.getTime())) {
        return false;
    }

    return kickoff <= new Date();
}

function hasOpenMatchStatus(status: string): boolean {
    return ['not started', 'ns', 'tbd', 'time to be defined'].includes(
        normalizeStatus(status),
    );
}

function hasClosedMatchStatus(status: string): boolean {
    const normalizedStatus = normalizeStatus(status);

    return [
        'live',
        'in progress',
        'halftime',
        'half-time',
        'full-time',
        'full time',
        'finished',
        'after penalties',
        'second half',
        'first half',
        'extra time',
        'penalties',
    ].some((closedStatus) => normalizedStatus.includes(closedStatus));
}

function normalizeStatus(status: string): string {
    return status.trim().toLowerCase();
}
