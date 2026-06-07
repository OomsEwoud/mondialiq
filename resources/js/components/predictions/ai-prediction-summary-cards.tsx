import { Gauge, Goal, Trophy } from 'lucide-react';
import AiPredictionSummaryCard from '@/components/predictions/ai-prediction-summary-card';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    score: string | null;
}

export default function AiPredictionSummaryCards({ match, score }: Props) {
    const prediction = match.aiPrediction;
    const numericConfidence = Number(prediction?.confidence);
    const confidenceValue = Number.isNaN(numericConfidence)
        ? null
        : Math.max(0, Math.min(100, Math.round(numericConfidence)));
    const confidenceLabel =
        confidenceValue !== null
            ? confidenceValue >= 70
                ? 'High confidence'
                : confidenceValue >= 40
                  ? 'Moderate confidence'
                  : 'Low confidence'
            : null;
    const confidenceColor =
        confidenceValue !== null
            ? confidenceValue >= 70
                ? 'bg-emerald-500'
                : confidenceValue >= 40
                  ? 'bg-cyan-500'
                  : 'bg-amber-400'
            : 'bg-slate-300';

    return (
        <section className="grid gap-4 md:grid-cols-3">
            <AiPredictionSummaryCard icon={Trophy} label="Predicted outcome">
                <p className="text-2xl font-bold text-slate-900">
                    {prediction?.label ?? 'N/A'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Model pick</p>
            </AiPredictionSummaryCard>

            <AiPredictionSummaryCard icon={Gauge} label="Confidence">
                <div className="flex items-end justify-between gap-2">
                    <p className="text-2xl font-bold text-slate-900">
                        {confidenceValue ?? '—'}%
                    </p>
                    {confidenceLabel && (
                        <p
                            className={cn(
                                'pb-0.5 text-xs font-bold',
                                confidenceValue! >= 70 && 'text-emerald-600',
                                confidenceValue! >= 40 &&
                                    confidenceValue! < 70 &&
                                    'text-cyan-600',
                                confidenceValue! < 40 && 'text-amber-600',
                            )}
                        >
                            {confidenceLabel}
                        </p>
                    )}
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-100">
                    <div
                        className={cn(
                            'h-3 rounded-full transition-all',
                            confidenceColor,
                        )}
                        style={{ width: `${confidenceValue ?? 0}%` }}
                    />
                </div>
            </AiPredictionSummaryCard>

            <AiPredictionSummaryCard icon={Goal} label="Expected score">
                <p className="text-2xl font-bold text-slate-900">
                    {score ?? 'N/A'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Projected final score
                </p>
            </AiPredictionSummaryCard>
        </section>
    );
}
