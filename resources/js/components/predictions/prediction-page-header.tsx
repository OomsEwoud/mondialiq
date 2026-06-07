import { Link } from '@inertiajs/react';
import { CalendarDays, Calculator } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function PredictionPageHeader({ scoringGuideHref }: Props) {
    return (
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                        AI match insights
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Predictions cockpit
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                        Compare model signals with your own picks, sort by
                        confidence and keep every matchday decision in one
                        focused view.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                        <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                            AI reports
                        </span>
                        <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                            Personal picks
                        </span>
                        <span className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
                            Confidence sorting
                        </span>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                    <Link
                        href={matches.url()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none sm:w-auto"
                    >
                        <CalendarDays className="size-4" />
                        View matches
                    </Link>
                    <Link
                        href={scoringGuideHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-5 py-3 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none sm:w-auto"
                    >
                        <Calculator className="size-4" />
                        How scoring works
                    </Link>
                </div>
            </div>
        </section>
    );
}
