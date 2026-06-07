import { Link } from '@inertiajs/react';
import { Calculator, CalendarDays, Trophy } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function LeaderboardsPageHeader({ scoringGuideHref }: Props) {
    const badges = ['Global ranking', 'Prediction groups', 'Scored out of 20'];

    return (
        <section className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-center shadow-lg sm:p-8">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Leaderboards
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Track the global race, see your current position, and keep up
                with the prediction groups that matter most.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {badges.map((badge) => (
                    <span
                        key={badge}
                        className="rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300"
                    >
                        {badge}
                    </span>
                ))}
            </div>
            <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                <Link
                    href={matches.url()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none sm:w-auto"
                >
                    <CalendarDays className="size-4" />
                    Make predictions
                </Link>
                <Link
                    href={scoringGuideHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none sm:w-auto"
                >
                    <Calculator className="size-4" />
                    How scoring works
                </Link>
            </div>
        </section>
    );
}
