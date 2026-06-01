import { Link } from '@inertiajs/react';
import { CalendarDays, Calculator, Sparkles } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function PredictionPageHeader({ scoringGuideHref }: Props) {
    return (
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-7">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 sm:size-12">
                <Sparkles size={22} />
            </div>
            <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                AI Match Insights
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Predictions
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Compare AI-powered match insights with your own predictions and
                see how confident each pick is.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                    AI model insights
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                    Personal prediction tracking
                </span>
            </div>
            <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                <Link
                    href={matches.url()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <CalendarDays className="size-4" />
                    View matches
                </Link>
                <Link
                    href={scoringGuideHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <Calculator className="size-4" />
                    How scoring works
                </Link>
            </div>
        </section>
    );
}
