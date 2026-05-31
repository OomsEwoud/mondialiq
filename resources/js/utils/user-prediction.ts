import type { Match } from '@/types/match';

type UserPredictionConfidence = NonNullable<
    Match['userPrediction']
>['confidence'];

export function formatPredictedOutcome(
    label: string | null | undefined,
): string {
    return label ?? 'Outcome not selected';
}

export function formatUserPredictionConfidence(
    confidence: UserPredictionConfidence,
): {
    value: string;
    helper?: string;
} {
    if (!confidence) {
        return { value: 'Confidence not provided' };
    }

    return {
        value: `${capitalize(confidence)} confidence`,
        helper: 'Your selected confidence level',
    };
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
