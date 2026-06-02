import { Sparkles } from 'lucide-react';
import { cleanAiAdvice } from '@/utils/ai-prediction';

interface Props {
    advice: string | null | undefined;
}

export default function AiPredictionAdviceCard({ advice }: Props) {
    const chips = ['Market signal', 'API signal', 'Match context'];

    return (
        <section className="rounded-[1.85rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:p-6">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                    <Sparkles className="size-4" />
                </span>
                <div>
                    <h2 className="text-2xl font-black text-blue-950">
                        Why this prediction?
                    </h2>
                    <p className="mt-1 text-sm leading-6 font-medium text-slate-500">
                        The AI weighs market signals, API predictions and
                        available match context.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {chips.map((chip) => (
                    <span
                        key={chip}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600"
                    >
                        {chip}
                    </span>
                ))}
            </div>

            <div className="mt-5 max-w-prose">
                <p className="text-sm leading-7 font-medium text-slate-700 sm:text-base">
                    {cleanAiAdvice(advice) ?? 'No AI explanation available yet'}
                </p>
            </div>
        </section>
    );
}
