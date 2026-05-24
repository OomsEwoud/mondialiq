import type { TeamDetailsPlayer } from '@/types/team-details';

export type PlayerPositionGroupKey =
    | 'goalkeepers'
    | 'defenders'
    | 'midfielders'
    | 'attackers'
    | 'other';

export interface PlayerPositionGroup {
    key: PlayerPositionGroupKey;
    label: string;
    players: TeamDetailsPlayer[];
}

const positionGroups: Record<
    PlayerPositionGroupKey,
    { label: string; order: number }
> = {
    goalkeepers: { label: 'Goalkeepers', order: 10 },
    defenders: { label: 'Defenders', order: 20 },
    midfielders: { label: 'Midfielders', order: 30 },
    attackers: { label: 'Attackers', order: 40 },
    other: { label: 'Other', order: 50 },
};

export function getPlayerDisplayName(player: TeamDetailsPlayer): string {
    return player.name ?? 'Unknown player';
}

export function getPersonInitials(name: string | null): string {
    if (!name) {
        return '';
    }

    const names = name.trim().split(' ').filter(Boolean);

    if (names.length === 0) {
        return '';
    }

    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }

    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
}

export function formatPositionLabel(position: string | null): string {
    return (
        {
            G: 'Goalkeeper',
            D: 'Defender',
            M: 'Midfielder',
            F: 'Attacker',
        }[position ?? ''] ??
        position ??
        'Position TBC'
    );
}

export function getPlayerPositionGroup(
    position: string | null,
): PlayerPositionGroupKey {
    const normalizedPosition = position?.trim().toLowerCase() ?? '';

    if (['g', 'goalkeeper', 'keeper'].includes(normalizedPosition)) {
        return 'goalkeepers';
    }

    if (normalizedPosition.startsWith('d')) {
        return 'defenders';
    }

    if (normalizedPosition.startsWith('m')) {
        return 'midfielders';
    }

    if (
        normalizedPosition.startsWith('f') ||
        normalizedPosition.includes('attack') ||
        normalizedPosition.includes('striker') ||
        normalizedPosition.includes('winger')
    ) {
        return 'attackers';
    }

    return 'other';
}

export function sortPlayersByPositionAndNumber(
    players: TeamDetailsPlayer[],
): TeamDetailsPlayer[] {
    return [...players].sort((first, second) => {
        const positionDifference =
            positionGroups[getPlayerPositionGroup(first.position)].order -
            positionGroups[getPlayerPositionGroup(second.position)].order;

        if (positionDifference !== 0) {
            return positionDifference;
        }

        const firstNumber = first.number ?? 999;
        const secondNumber = second.number ?? 999;

        if (firstNumber !== secondNumber) {
            return firstNumber - secondNumber;
        }

        return getPlayerDisplayName(first).localeCompare(
            getPlayerDisplayName(second),
        );
    });
}

export function groupPlayersByPosition(
    players: TeamDetailsPlayer[],
): PlayerPositionGroup[] {
    const sortedPlayers = sortPlayersByPositionAndNumber(players);

    return Object.entries(positionGroups)
        .map(([key, group]) => ({
            key: key as PlayerPositionGroupKey,
            label: group.label,
            players: sortedPlayers.filter(
                (player) =>
                    getPlayerPositionGroup(player.position) ===
                    (key as PlayerPositionGroupKey),
            ),
        }))
        .filter((group) => group.players.length > 0);
}

export function filterPlayersByQuery(
    players: TeamDetailsPlayer[],
    query: string,
): TeamDetailsPlayer[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return players;
    }

    return players.filter((player) => {
        const searchableValues = [
            getPlayerDisplayName(player),
            player.position,
            formatPositionLabel(player.position),
            player.country,
            player.number?.toString(),
        ];

        return searchableValues.some((value) =>
            value?.toLowerCase().includes(normalizedQuery),
        );
    });
}
