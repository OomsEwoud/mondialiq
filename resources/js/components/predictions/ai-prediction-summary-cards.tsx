import { Gauge, Goal, Trophy } from 'lucide-react';
import AiPredictionSummaryCard from '@/components/predictions/ai-prediction-summary-card';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';
import { formatAiConfidence } from '@/utils/ai-prediction';

interface Props {
    match: Match;
    score: string | null;
}

export default function AiPredictionSummaryCards({ match, score }: Props) {
    const prediction = match.aiPrediction;
    const confidence = formatAiConfidence(prediction?.confidence);
    const numericConfidence = Number(prediction?.confidence);
    const confidenceValue = Number.isNaN(numericConfidence)
        ? null
        : Math.max(0, Math.min(100, Math.round(numericConfidence)));
    const predictedOutcome = prediction?.label ?? 'Outcome not available';
    const expectedScore = score ?? 'Score prediction not available';

    return (
        <section className="grid gap-4 md:grid-cols-3">
            <AiPredictionSummaryCard icon={Trophy} label="Predicted outcome">
                <p className="text-2xl leading-tight font-bold text-slate-900">
                    {predictedOutcome}
                </p>
                <p className="mt-2 text-xs font-bold text-cyan-700">
                    AI model pick
                </p>
            </AiPredictionSummaryCard>

            <AiPredictionSummaryCard icon={Gauge} label="Confidence">
                <div className="flex items-end justify-between gap-3">
                    <p className="text-2xl leading-tight font-bold text-slate-900">
                        {confidence.value}
                    </p>
                    <p className="pb-1 text-xs font-bold text-slate-500">
                        {confidence.label}
                    </p>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-slate-100">
                    <div
                        className={cn(
                            'h-2.5 rounded-full shadow-sm',
                            confidenceValue === null && 'bg-slate-300',
                            confidenceValue !== null &&
                                confidenceValue < 40 &&
                                'bg-amber-300',
                            confidenceValue !== null &&
                                confidenceValue >= 40 &&
                                confidenceValue < 70 &&
                                'bg-cyan-400',
                            confidenceValue !== null &&
                                confidenceValue >= 70 &&
                                'bg-emerald-400',
                        )}
                        style={{ width: `${confidenceValue ?? 0}%` }}
                    />
                </div>
            </AiPredictionSummaryCard>

            <AiPredictionSummaryCard icon={Goal} label="Expected score">
                <p className="text-3xl leading-none font-bold text-slate-900">
                    {expectedScore}
                </p>
                <p className="mt-2 text-xs font-bold text-slate-500">
                    Projected final score
                </p>
            </AiPredictionSummaryCard>
        </section>
    );
}
