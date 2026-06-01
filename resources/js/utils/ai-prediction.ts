import type { MarketOddsSummary } from '@/types/prediction';

type FormattedAiConfidence = {
    value: string;
    label: string;
};

export function formatAiConfidence(
    confidence: string | null | undefined,
): FormattedAiConfidence {
    if (!confidence) {
        return {
            value: 'Not available',
            label: 'Confidence not available',
        };
    }

    const numericConfidence = Number(confidence);

    if (Number.isNaN(numericConfidence)) {
        return {
            value: confidence,
            label: 'Model confidence',
        };
    }

    return {
        value: `${Math.round(numericConfidence)} / 100`,
        label: aiConfidenceLabel(numericConfidence),
    };
}

export function formatProbability(value: number | null): string {
    if (value === null) {
        return 'Not available';
    }

    return `${Math.round(value)}%`;
}

export function cleanAiAdvice(
    advice: string | null | undefined,
): string | null {
    return advice?.replace(/^AI outcome:\s*[^.]+\.\s*/i, '').trim() || null;
}

export function hasMarketOdds(marketOdds: MarketOddsSummary): boolean {
    return [
        marketOdds.home_win_probability,
        marketOdds.draw_probability,
        marketOdds.away_win_probability,
        marketOdds.over_2_5_probability,
        marketOdds.most_likely_score,
    ].some((value) => value !== null);
}

function aiConfidenceLabel(confidence: number): string {
    if (confidence >= 70) {
        return 'High confidence';
    }

    if (confidence >= 40) {
        return 'Moderate confidence';
    }

    return 'Low confidence';
}
