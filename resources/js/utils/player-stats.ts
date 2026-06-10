import type { PlayerDetailsSeasonStat } from '@/types/player-details';

export function isGoalkeeper(position: string | null): boolean {
    if (!position) {
        return false;
    }

    const p = position.toLowerCase();

    return ['goalkeeper', 'keeper', 'g', 'gk'].includes(p);
}

export function hasValue(value: number | null | undefined): boolean {
    return value !== null && value !== undefined;
}

export function shouldShowAttacking(stat: PlayerDetailsSeasonStat): boolean {
    const {
        totalShots,
        shotsOnTarget,
        goals,
        assists,
        dribblesSuccess,
        dribblesPast,
        penaltiesScored,
        penaltiesMissed,
    } = stat;

    return [
        totalShots,
        shotsOnTarget,
        goals,
        assists,
        dribblesSuccess,
        dribblesPast,
        penaltiesScored,
        penaltiesMissed,
    ].some(hasValue);
}

export function shouldShowPassing(stat: PlayerDetailsSeasonStat): boolean {
    const { totalPasses, keyPasses, passAccuracy, assists } = stat;

    return [totalPasses, keyPasses, passAccuracy, assists].some(hasValue);
}

export function shouldShowDefensive(stat: PlayerDetailsSeasonStat): boolean {
    const {
        tackles,
        blocks,
        interceptions,
        totalDuels,
        duelsWon,
        foulsDrawn,
        foulsCommitted,
    } = stat;

    return [
        tackles,
        blocks,
        interceptions,
        totalDuels,
        duelsWon,
        foulsDrawn,
        foulsCommitted,
    ].some(hasValue);
}

export function shouldShowDiscipline(stat: PlayerDetailsSeasonStat): boolean {
    const {
        yellowCards,
        yellowRedCards,
        redCards,
        penaltiesCommitted,
        penaltiesWon,
    } = stat;

    return [
        yellowCards,
        yellowRedCards,
        redCards,
        penaltiesCommitted,
        penaltiesWon,
    ].some(hasValue);
}

export function shouldShowGoalkeeping(
    stat: PlayerDetailsSeasonStat,
    position: string | null,
): boolean {
    if (!isGoalkeeper(position)) {
        return false;
    }

    const { saves, goalsConceded, penaltiesSaved, penaltiesMissed } = stat;

    return [saves, goalsConceded, penaltiesSaved, penaltiesMissed].some(
        hasValue,
    );
}
