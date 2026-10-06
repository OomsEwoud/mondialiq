export function rankingPercentage(value: number | null): string {
    return value === null
        ? '—'
        : `${new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 1 }).format(value)}%`;
}

export function rankingChange(value: number | null): string {
    return value === null
        ? '—'
        : `${value > 0 ? '+' : ''}${new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 1 }).format(value)} pp`;
}

export function predictionOutcomeLabel(
    outcome: string | null,
    homeTeam: string,
    awayTeam: string,
): string {
    switch (outcome) {
        case 'home':
            return `${homeTeam} wint`;
        case 'away':
            return `${awayTeam} wint`;
        case 'draw':
            return 'Gelijkspel';
        case 'home_or_draw':
            return `${homeTeam} of gelijkspel`;
        case 'away_or_draw':
            return `${awayTeam} of gelijkspel`;
        case 'home_or_away':
            return 'Geen gelijkspel';
        default:
            return 'Geen uitkomst vastgelegd';
    }
}
