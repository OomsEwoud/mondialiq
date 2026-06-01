import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { matches } from '@/routes';

interface Props {
    mode: 'ai' | 'mine';
    message: string;
}

export default function EmptyPredictionsState({ mode, message }: Props) {
    const isAiMode = mode === 'ai';

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-10 text-center shadow-sm shadow-blue-950/5 backdrop-blur">
            <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                Empty board
            </p>
            <h2 className="text-lg font-black text-slate-950">
                {isAiMode
                    ? 'AI predictions are warming up'
                    : 'Your prediction board is empty'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {isAiMode
                    ? 'Once model insights are available, you will see winner probabilities, score trends and confidence here.'
                    : message}
            </p>
            <Link
                href={matches()}
                aria-label="View matches to explore prediction opportunities"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-blue-950 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                View matches
                <ArrowRight className="h-4 w-4" />
            </Link>
        </section>
    );
}
