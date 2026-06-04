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
const liveStatusCodes = ['1h', 'ht', '2h', 'et', 'bt', 'p', 'live'];

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

    if (
        liveStatusCodes.includes(status) ||
        liveStatuses.some((liveStatus) => status.includes(liveStatus))
    ) {
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
        const status = getReadableLiveStatus(match.status);

        return match.elapsedTime !== null
            ? `${status} ${match.elapsedTime}'`
            : status;
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

export function getReadableLiveStatus(
    statusLong: string | null,
    statusShort?: string | null,
): string {
    const status = statusLong || statusShort || 'Live';
    const normalizedStatus = status.trim().toLowerCase();

    const readableStatuses: Record<string, string> = {
        '1h': 'First Half',
        'first half': 'First Half',
        ht: 'Half Time',
        halftime: 'Half Time',
        'half time': 'Half Time',
        '2h': 'Second Half',
        '2nd half started': 'Second Half',
        'second half': 'Second Half',
        et: 'Extra Time',
        'extra time': 'Extra Time',
        bt: 'Break Time',
        'break time': 'Break Time',
        p: 'Penalties',
        'penalty in progress': 'Penalties',
        live: 'Live',
    };

    return readableStatuses[normalizedStatus] ?? status;
}

export function getLiveStatusLabel(
    statusLong: string | null,
    statusShort: string | null,
    elapsedTime: number | null,
): string {
    const status = getReadableLiveStatus(statusLong, statusShort);

    return elapsedTime !== null ? `${status} ${elapsedTime}'` : status;
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
