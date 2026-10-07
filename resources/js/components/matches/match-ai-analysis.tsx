import { LoaderCircle, Sparkles } from 'lucide-react';
import type { Match } from '@/types/match';
import { formatAiConfidence } from '@/utils/ai-prediction';

interface Props {
    match: Match;
    state?: 'available' | 'processing' | 'unavailable';
}

export default function MatchAiAnalysis({
    match,
    state = match.hasAiPrediction ? 'available' : 'unavailable',
}: Props) {
    if (state !== 'available') {
        const Icon = state === 'processing' ? LoaderCircle : Sparkles;

        return (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {state === 'processing'
                    ? 'AI-analyse wordt voorbereid'
                    : 'AI-analyse binnenkort'}
            </p>
        );
    }

    const chances = match.prediction;
    const probabilities = chances
        ? [chances.homeWin, chances.draw, chances.awayWin]
        : [];
    const hasProbabilities =
        probabilities.length === 3 &&
        probabilities.every(
            (value) => Number.isFinite(value) && value >= 0 && value <= 100,
        ) &&
        probabilities.some((value) => value > 0);

    return (
        <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                AI-analyse
            </p>
            {hasProbabilities ? (
                <>
                    <div
                        className="mt-2 flex gap-3 text-xs text-muted-foreground"
                        aria-label={`${match.homeTeam} ${chances!.homeWin}%, gelijk ${chances!.draw}%, ${match.awayTeam} ${chances!.awayWin}%`}
                    >
                        <span>
                            {match.homeTeamShort}{' '}
                            <strong className="font-semibold text-foreground">
                                {Math.round(chances!.homeWin)}%
                            </strong>
                        </span>
                        <span>
                            Gelijk{' '}
                            <strong className="font-semibold text-foreground">
                                {Math.round(chances!.draw)}%
                            </strong>
                        </span>
                        <span>
                            {match.awayTeamShort}{' '}
                            <strong className="font-semibold text-foreground">
                                {Math.round(chances!.awayWin)}%
                            </strong>
                        </span>
                    </div>
                    <div
                        className="mt-2 flex h-1 gap-0.5 overflow-hidden rounded-full"
                        aria-hidden="true"
                    >
                        {probabilities.map((value, index) => (
                            <span
                                key={index}
                                style={{ flexGrow: value, flexBasis: 0 }}
                                className={
                                    value === Math.max(...probabilities)
                                        ? 'bg-primary/70'
                                        : index === 1
                                          ? 'bg-muted-foreground/40'
                                          : 'bg-muted-foreground/70'
                                }
                            />
                        ))}
                    </div>
                </>
            ) : (
                <p className="mt-1 text-sm text-foreground">
                    {match.aiPrediction?.label ?? 'Analyse beschikbaar'}
                </p>
            )}
            {!hasProbabilities && match.aiPrediction?.confidence && (
                <p className="mt-1 text-xs text-muted-foreground">
                    Zekerheid:{' '}
                    {formatAiConfidence(match.aiPrediction.confidence).value}
                </p>
            )}
        </div>
    );
}
