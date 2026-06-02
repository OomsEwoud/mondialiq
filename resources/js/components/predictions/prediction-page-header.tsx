import { Link } from '@inertiajs/react';
import { CalendarDays, Calculator } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function PredictionPageHeader({ scoringGuideHref }: Props) {
    return (
        <section className="mb-5 overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.28),transparent_22rem),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_20rem),linear-gradient(135deg,#0b1748_0%,#18286f_54%,#0f6fa2_110%)] p-6 shadow-2xl shadow-blue-950/15 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                    <p className="text-xs font-black tracking-[0.24em] text-cyan-100 uppercase">
                        AI match insights
                    </p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Predictions cockpit
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                        Compare model signals with your own picks, sort by
                        confidence and keep every matchday decision in one
                        focused view.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2.5">
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50 backdrop-blur">
                            AI reports
                        </span>
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50 backdrop-blur">
                            Personal picks
                        </span>
                        <span className="rounded-full border border-cyan-100/25 bg-white/10 px-3 py-1 text-xs font-black text-cyan-50 backdrop-blur">
                            Confidence sorting
                        </span>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                    <Link
                        href={matches.url()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-blue-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none sm:w-auto"
                    >
                        <CalendarDays className="size-4" />
                        View matches
                    </Link>
                    <Link
                        href={scoringGuideHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 focus-visible:outline-none sm:w-auto"
                    >
                        <Calculator className="size-4" />
                        How scoring works
                    </Link>
                </div>
            </div>
        </section>
    );
}
