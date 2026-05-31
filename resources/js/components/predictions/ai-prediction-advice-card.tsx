import { Sparkles } from 'lucide-react';
import { cleanAiAdvice } from '@/utils/ai-prediction';

interface Props {
    advice: string | null | undefined;
}

export default function AiPredictionAdviceCard({ advice }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-blue-100 text-blue-900">
                    <Sparkles className="size-4" />
                </span>
                <div>
                    <h2 className="text-base font-black text-blue-950">
                        Why this prediction?
                    </h2>
                    <p className="text-xs font-medium text-slate-500">
                        Model reasoning based on the available match context.
                    </p>
                </div>
            </div>

            <div className="mt-4 max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-7 font-medium text-slate-700">
                    {cleanAiAdvice(advice) ?? 'No AI explanation available yet'}
                </p>
            </div>
        </section>
    );
}
