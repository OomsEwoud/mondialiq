import type { Match } from '@/types/match';

export function formatMatchCompetition(
    match: Pick<Match, 'leagueName' | 'round'>,
): string {
    const round = match.round
        .replace(/^Group Stage\s*-\s*(\d+)$/i, 'Groepsfase · Speeldag $1')
        .replace(/^Group Stage$/i, 'Groepsfase')
        .replace(/^Group ([A-Z])$/i, 'Groep $1')
        .replace(/^Regular Season\s*-\s*(\d+)$/i, 'Speeldag $1')
        .replace(/^Round of 16$/i, 'Achtste finales')
        .replace(/^Quarter-finals$/i, 'Kwartfinales')
        .replace(/^Semi-finals$/i, 'Halve finales')
        .replace(/^Final$/i, 'Finale');

    return [match.leagueName, round].filter(Boolean).join(' · ');
}
