export type MatchStatCategory =
    | 'Attack'
    | 'Possession & passing'
    | 'Discipline & defending'
    | 'Goalkeeping'
    | 'Other';

const statLabels: Record<string, string> = {
    expectedgoals: 'Expected goals',
    goalsprevented: 'Goals prevented',
    ballpossession: 'Ball possession',
    passespercent: 'Pass accuracy',
    shotsinsidebox: 'Shots inside box',
    shotsoutsidebox: 'Shots outside box',
};

const comparableStats = new Set([
    'ballpossession',
    'expectedgoals',
    'totalshots',
    'shotsongoal',
    'shotsoffgoal',
    'shotsinsidebox',
    'shotsoutsidebox',
    'blockedshots',
    'cornerkicks',
    'totalpasses',
    'passesaccurate',
    'passespercent',
    'duelswon',
]);

const neutralStats = new Set([
    'fouls',
    'yellowcards',
    'redcards',
    'offsides',
    'goalkeepersaves',
    'goalsprevented',
]);

const statOrder: Record<string, number> = {
    expectedgoals: 10,
    totalshots: 20,
    shotsongoal: 30,
    shotsoffgoal: 40,
    shotsinsidebox: 50,
    shotsoutsidebox: 60,
    blockedshots: 70,
    cornerkicks: 80,
    ballpossession: 10,
    totalpasses: 20,
    passesaccurate: 30,
    passespercent: 40,
};

export function formatStatLabel(name: string): string {
    const normalizedName = normalizeStatName(name);

    if (statLabels[normalizedName]) {
        return statLabels[normalizedName];
    }

    return name
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function isComparableStat(name: string): boolean {
    const normalizedName = normalizeStatName(name);

    return (
        comparableStats.has(normalizedName) && !neutralStats.has(normalizedName)
    );
}

export function getStatCategory(name: string): MatchStatCategory {
    const normalizedName = normalizeStatName(name);

    if (
        [
            'expectedgoals',
            'totalshots',
            'shotsongoal',
            'shotsoffgoal',
            'shotsinsidebox',
            'shotsoutsidebox',
            'blockedshots',
            'cornerkicks',
        ].includes(normalizedName)
    ) {
        return 'Attack';
    }

    if (
        [
            'ballpossession',
            'totalpasses',
            'passesaccurate',
            'passespercent',
        ].includes(normalizedName)
    ) {
        return 'Possession & passing';
    }

    if (
        ['fouls', 'yellowcards', 'redcards', 'offsides', 'duelswon'].includes(
            normalizedName,
        )
    ) {
        return 'Discipline & defending';
    }

    if (['goalkeepersaves', 'goalsprevented'].includes(normalizedName)) {
        return 'Goalkeeping';
    }

    return 'Other';
}

export function sortStatsByDisplayPriority<T extends { name: string }>(
    stats: T[],
): T[] {
    return [...stats].sort((first, second) => {
        const firstPriority = statOrder[normalizeStatName(first.name)] ?? 100;
        const secondPriority = statOrder[normalizeStatName(second.name)] ?? 100;

        if (firstPriority !== secondPriority) {
            return firstPriority - secondPriority;
        }

        return formatStatLabel(first.name).localeCompare(
            formatStatLabel(second.name),
        );
    });
}

export function normalizeStatName(name: string): string {
    return name.toLowerCase().replace(/[%&\s_-]/g, '');
}
