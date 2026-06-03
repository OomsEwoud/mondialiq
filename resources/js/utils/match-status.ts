import type { Match, MatchScore } from '@/types/match';

export type MatchStatusKind =
    | 'upcoming'
    | 'finished'
    | 'postponed'
    | 'cancelled'
    | 'live'
    | 'unknown';

const liveStatuses = [
    'live',
    'kick off',
    'first half',
    'halftime',
    '2nd half started',
    'second half',
    'extra time',
    'break time',
    'penalty in progress',
    'match suspended',
    'match interrupted',
    'in progress',
];

export function getMatchStatusKind(match: Match): MatchStatusKind {
    const status = match.status.toLowerCase();

    if (status.includes('finish')) {
        return 'finished';
    }

    if (status.includes('postpon')) {
        return 'postponed';
    }

    if (
        status.includes('cancel') ||
        status.includes('abandon') ||
        status.includes('forfeit')
    ) {
        return 'cancelled';
    }

    if (liveStatuses.some((liveStatus) => status.includes(liveStatus))) {
        return 'live';
    }

    if (
        status.includes('not started') ||
        status.includes('time to be defined')
    ) {
        return 'upcoming';
    }

    return 'unknown';
}

export function getMatchStatusLabel(match: Match): string {
    const kind = getMatchStatusKind(match);

    if (kind === 'live') {
        const status = readableLiveStatus(match.status);

        return match.elapsedTime ? `${status} ${match.elapsedTime}'` : status;
    }

    return (
        {
            upcoming: 'Upcoming',
            finished: 'Full-time',
            postponed: 'Postponed',
            cancelled: 'Cancelled',
            unknown: match.status || 'Upcoming',
        } satisfies Record<Exclude<MatchStatusKind, 'live'>, string>
    )[kind];
}

function readableLiveStatus(status: string): string {
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === '1h') {
        return 'First Half';
    }

    if (normalizedStatus === '2h') {
        return 'Second Half';
    }

    if (normalizedStatus === 'ht') {
        return 'Half Time';
    }

    if (normalizedStatus === 'et') {
        return 'Extra Time';
    }

    if (normalizedStatus === 'bt') {
        return 'Break Time';
    }

    if (normalizedStatus === 'p') {
        return 'Penalties';
    }

    return status || 'Live';
}

export function isMatchFinished(match: Match): boolean {
    return getMatchStatusKind(match) === 'finished';
}

export function isMatchUpcoming(match: Match): boolean {
    return ['upcoming', 'unknown'].includes(getMatchStatusKind(match));
}

export function shouldShowMatchScore(match: Match): boolean {
    return ['finished', 'live'].includes(getMatchStatusKind(match));
}

export function getDisplayMatchScore(match: Match): MatchScore {
    return match.score.fulltime;
}

export function hasDisplayMatchScore(match: Match): boolean {
    const score = getDisplayMatchScore(match);

    return score.home !== null && score.away !== null;
}

export function getWinner(match: Match): 'home' | 'away' | 'draw' | null {
    if (!isMatchFinished(match) || !hasDisplayMatchScore(match)) {
        return null;
    }

    const score = getDisplayMatchScore(match);

    if (score.home === score.away) {
        return 'draw';
    }

    return Number(score.home) > Number(score.away) ? 'home' : 'away';
}
