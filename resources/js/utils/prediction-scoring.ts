import type {
    MatchOutcome,
    PredictionScoreBreakdown,
    PredictionScoreInput,
    PredictionScoreItem,
} from '@/types/prediction-scoring';

export function getMatchOutcome(
    homeScore: number,
    awayScore: number,
): MatchOutcome {
    if (homeScore > awayScore) {
        return 'home';
    }

    if (homeScore < awayScore) {
        return 'away';
    }

    return 'draw';
}

export function calculatePredictionScore({
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
}: PredictionScoreInput): PredictionScoreBreakdown {
    const predictedOutcome = getMatchOutcome(
        predictedHomeScore,
        predictedAwayScore,
    );
    const actualOutcome = getMatchOutcome(actualHomeScore, actualAwayScore);
    const exactScore =
        predictedHomeScore === actualHomeScore &&
        predictedAwayScore === actualAwayScore;

    if (exactScore) {
        return perfectScoreBreakdown();
    }

    const correctOutcome = predictedOutcome === actualOutcome;
    const drawBonus = actualOutcome === 'draw' && predictedOutcome === 'draw';
    const correctGoalDifference =
        goalDifference(predictedHomeScore, predictedAwayScore) ===
        goalDifference(actualHomeScore, actualAwayScore);
    const correctHomeGoals = predictedHomeScore === actualHomeScore;
    const correctAwayGoals = predictedAwayScore === actualAwayScore;
    const correctTotalGoals =
        totalGoals(predictedHomeScore, predictedAwayScore) ===
        totalGoals(actualHomeScore, actualAwayScore);
    const items = scoreItems({
        correctOutcome,
        drawBonus,
        correctGoalDifference,
        correctHomeGoals,
        correctAwayGoals,
        correctTotalGoals,
    });

    return {
        exactScore,
        correctOutcome,
        drawBonus,
        correctGoalDifference,
        correctHomeGoals,
        correctAwayGoals,
        correctTotalGoals,
        total: Math.min(earnedPoints(items), 20),
        items,
    };
}

function perfectScoreBreakdown(): PredictionScoreBreakdown {
    return {
        exactScore: true,
        correctOutcome: true,
        drawBonus: false,
        correctGoalDifference: true,
        correctHomeGoals: true,
        correctAwayGoals: true,
        correctTotalGoals: true,
        total: 20,
        items: [
            {
                label: 'Exact score',
                description: 'You predicted the full-time score perfectly.',
                points: 20,
                earned: true,
            },
        ],
    };
}

function scoreItems({
    correctOutcome,
    drawBonus,
    correctGoalDifference,
    correctHomeGoals,
    correctAwayGoals,
    correctTotalGoals,
}: Omit<
    PredictionScoreBreakdown,
    'exactScore' | 'items' | 'total'
>): PredictionScoreItem[] {
    return [
        {
            label: 'Correct outcome',
            description: 'Correct winner or correctly predicted a draw.',
            points: 8,
            earned: correctOutcome,
        },
        {
            label: 'Draw bonus',
            description: 'Extra reward for correctly predicting a draw.',
            points: 2,
            earned: drawBonus,
        },
        {
            label: 'Goal difference',
            description: 'Correct goal difference between both teams.',
            points: 4,
            earned: correctGoalDifference,
        },
        {
            label: 'Home team goals',
            description: 'Correct amount of goals for the home team.',
            points: 3,
            earned: correctHomeGoals,
        },
        {
            label: 'Away team goals',
            description: 'Correct amount of goals for the away team.',
            points: 3,
            earned: correctAwayGoals,
        },
        {
            label: 'Total goals',
            description: 'Correct total number of goals in the match.',
            points: 2,
            earned: correctTotalGoals,
        },
    ];
}

function earnedPoints(items: PredictionScoreItem[]): number {
    return items.reduce(
        (total, item) => total + (item.earned ? item.points : 0),
        0,
    );
}

function goalDifference(homeScore: number, awayScore: number): number {
    return homeScore - awayScore;
}

function totalGoals(homeScore: number, awayScore: number): number {
    return homeScore + awayScore;
}
