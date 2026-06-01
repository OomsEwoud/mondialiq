import { Link } from '@inertiajs/react';
import { CalendarDays, Calculator } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function PredictionPageHeader({ scoringGuideHref }: Props) {
    return (
        <section className="mb-5 overflow-hidden rounded-2xl border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.24),transparent_24rem),linear-gradient(135deg,#0b1748_0%,#14236f_58%,#0e7490_150%)] p-5 shadow-2xl shadow-blue-950/15 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                    <p className="text-xs font-black tracking-[0.2em] text-cyan-100 uppercase">
                        AI match insights
                    </p>
                    <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Predictions cockpit
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Compare model signals with your own picks, sort by
                        confidence and keep every matchday decision in one
                        focused view.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50">
                            AI reports
                        </span>
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50">
                            Personal picks
                        </span>
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50">
                            Confidence sorting
                        </span>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                    <Link
                        href={matches.url()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-blue-950 shadow-sm shadow-blue-950/20 transition hover:bg-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none sm:w-auto"
                    >
                        <CalendarDays className="size-4" />
                        View matches
                    </Link>
                    <Link
                        href={scoringGuideHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-black text-white transition hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none sm:w-auto"
                    >
                        <Calculator className="size-4" />
                        How scoring works
                    </Link>
                </div>
            </div>
        </section>
    );
}
