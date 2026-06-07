import type { Match } from '@/types/match';
import type { MarketOddsSummary } from '@/types/prediction';

export type AiPredictionOutcome = 'home' | 'draw' | 'away';

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

export function getActualOutcome(match: Match): AiPredictionOutcome | null {
    return outcomeFromScore(
        match.score.fulltime.home,
        match.score.fulltime.away,
    );
}

export function getPredictedOutcome(match: Match): AiPredictionOutcome | null {
    const prediction = match.aiPrediction;

    if (!prediction) {
        return null;
    }

    const outcomeFromPredictionScore = outcomeFromScore(
        prediction.homeScore,
        prediction.awayScore,
    );

    return outcomeFromPredictionScore ?? prediction.outcome;
}

export function getActualScoreLabel(match: Match): string | null {
    const homeScore = match.score.fulltime.home;
    const awayScore = match.score.fulltime.away;

    if (homeScore === null || awayScore === null) {
        return null;
    }

    return `${homeScore} - ${awayScore}`;
}

export function isOutcomeCorrect(match: Match): boolean | null {
    const actualOutcome = getActualOutcome(match);
    const predictedOutcome = getPredictedOutcome(match);

    if (actualOutcome === null || predictedOutcome === null) {
        return null;
    }

    return actualOutcome === predictedOutcome;
}

export function isExactScoreCorrect(match: Match): boolean | null {
    const prediction = match.aiPrediction;
    const actualHomeScore = match.score.fulltime.home;
    const actualAwayScore = match.score.fulltime.away;

    if (
        prediction === null ||
        prediction === undefined ||
        prediction.homeScore === null ||
        prediction.awayScore === null ||
        actualHomeScore === null ||
        actualAwayScore === null
    ) {
        return null;
    }

    return (
        prediction.homeScore === actualHomeScore &&
        prediction.awayScore === actualAwayScore
    );
}

export function isFinishedFixture(match: Match): boolean {
    return (
        getActualScoreLabel(match) !== null && hasFinishedStatus(match.status)
    );
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

function outcomeFromScore(
    homeScore: number | null,
    awayScore: number | null,
): AiPredictionOutcome | null {
    if (homeScore === null || awayScore === null) {
        return null;
    }

    if (homeScore > awayScore) {
        return 'home';
    }

    if (homeScore < awayScore) {
        return 'away';
    }

    return 'draw';
}

function hasFinishedStatus(status: string): boolean {
    const normalizedStatus = status.trim().toLowerCase();

    return [
        'ft',
        'full time',
        'full-time',
        'finished',
        'match finished',
        'after extra time',
        'after penalties',
        'aet',
        'penalties',
    ].some((finishedStatus) => normalizedStatus.includes(finishedStatus));
}
