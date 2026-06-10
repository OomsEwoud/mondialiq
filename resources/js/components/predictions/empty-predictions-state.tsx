import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { matches } from '@/routes';

interface Props {
    mode: 'ai' | 'mine' | 'user';
    message: string;
}

export default function EmptyPredictionsState({ mode, message }: Props) {
    const isAiMode = mode === 'ai';
    const isUserMode = mode === 'user';

    const title = isAiMode
        ? 'AI predictions are warming up'
        : isUserMode
            ? 'No predictions shared'
            : 'Your prediction board is empty';

    const description = isAiMode
        ? 'Once model insights are available, you will see winner probabilities, score trends and confidence here.'
        : message;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                Empty board
            </p>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {description}
            </p>
            {!isUserMode && (
                <Link
                    href={matches()}
                    aria-label="View matches to explore prediction opportunities"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    View matches
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </section>
    );
}
