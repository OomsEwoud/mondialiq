import { Sparkles } from 'lucide-react';
import { cleanAiAdvice } from '@/utils/ai-prediction';

interface Props {
    advice: string | null | undefined;
}

export default function AiPredictionAdviceCard({ advice }: Props) {
    const chips = ['Market signal', 'API signal', 'Match context'];

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Sparkles className="size-5" />
                </span>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Why this prediction?
                    </h2>
                    <p className="text-sm text-slate-500">
                        The AI weighs market signals, API predictions and match
                        context.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {chips.map((chip) => (
                    <span
                        key={chip}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                        {chip}
                    </span>
                ))}
            </div>

            <div className="mt-5">
                <p className="text-sm leading-7 text-slate-700 sm:text-base">
                    {cleanAiAdvice(advice) ?? 'No AI explanation available yet'}
                </p>
            </div>
        </section>
    );
}
