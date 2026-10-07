import type { Match } from '@/types/match';
import type { AiPredictionContext } from '@/types/prediction';
import type {
    OutcomeEstimate,
    PredictionSignal,
} from '@/types/prediction-analysis';
import { getPredictedOutcome } from '@/utils/ai-prediction';

export function outcomeEstimates(match: Match): OutcomeEstimate[] {
    const probabilities = match.prediction;

    if (!probabilities) {
        return [];
    }

    const estimates = [
        { label: match.homeTeam, value: probabilities.homeWin },
        { label: 'Gelijkspel', value: probabilities.draw },
        { label: match.awayTeam, value: probabilities.awayWin },
    ];

    if (
        !estimates.every(({ value }) => validProbability(value)) ||
        Math.abs(estimates.reduce((sum, { value }) => sum + value, 0) - 100) > 1
    ) {
        return [];
    }

    return estimates;
}

export function predictionOutlook(match: Match): string {
    const outcome = getPredictedOutcome(match);

    if (outcome === 'home') {
        return `${match.homeTeam} favoriet`;
    }

    if (outcome === 'away') {
        return `${match.awayTeam} favoriet`;
    }

    return outcome === 'draw'
        ? 'Gelijkspel verwacht'
        : 'Voorspelling nog niet beschikbaar';
}

export function predictionSignals(
    match: Match,
    context: AiPredictionContext,
): PredictionSignal[] {
    const source = context.apiPrediction;

    if (!source) {
        return [];
    }

    const signals: PredictionSignal[] = [];
    const outcomes = [
        { label: `Winst ${match.homeTeam}`, value: source.api_home_chance },
        { label: 'Gelijkspel', value: source.api_draw_chance },
        { label: `Winst ${match.awayTeam}`, value: source.api_away_chance },
    ];

    for (const { label, value } of outcomes) {
        if (validProbability(value)) {
            signals.push({ label, value: `${Math.round(value)}%` });
        }
    }

    const trend = source.api_goal_trend?.match(
        /^(over|under) (\d+(?:\.\d+)?)$/i,
    );

    if (trend) {
        signals.push({
            label: 'Doelpuntenverwachting',
            value: `${trend[1].toLowerCase() === 'over' ? 'Meer' : 'Minder'} dan ${trend[2].replace('.', ',')} goals`,
        });
    }

    return signals;
}

function validProbability(value: number | null | undefined): value is number {
    return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 100
    );
}
