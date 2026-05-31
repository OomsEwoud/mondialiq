import type {
    MatchDetailsLineupPlayer,
    MatchDetailsLineupTeam,
} from '@/types/match-details';

export function hasLineupData(lineup: MatchDetailsLineupTeam): boolean {
    return (
        Boolean(lineup.formation) ||
        lineup.starters.length > 0 ||
        lineup.substitutes.length > 0
    );
}

export function formatLineupPositionLabel(position: string | null): string {
    return position ?? 'Position unknown';
}

export function sortLineupPlayersByPosition(
    players: MatchDetailsLineupPlayer[],
): MatchDetailsLineupPlayer[] {
    return [...players].sort((first, second) => {
        const positionDifference =
            lineupPositionSortOrder(first.position) -
            lineupPositionSortOrder(second.position);

        if (positionDifference !== 0) {
            return positionDifference;
        }

        const firstNumber = first.number ?? 999;
        const secondNumber = second.number ?? 999;

        if (firstNumber !== secondNumber) {
            return firstNumber - secondNumber;
        }

        return first.name.localeCompare(second.name);
    });
}

function lineupPositionSortOrder(position: string | null): number {
    return (
        {
            G: 10,
            D: 20,
            M: 30,
            F: 40,
        }[position ?? ''] ?? 50
    );
}
