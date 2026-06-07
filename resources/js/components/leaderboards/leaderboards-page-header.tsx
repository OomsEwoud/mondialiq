import { Link } from '@inertiajs/react';
import { Calculator, CalendarDays, Trophy } from 'lucide-react';
import { matches } from '@/routes';

interface Props {
    scoringGuideHref: string;
}

export default function LeaderboardsPageHeader({ scoringGuideHref }: Props) {
    const badges = ['Global ranking', 'Prediction groups', 'Scored out of 20'];

    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-cyan-50 text-slate-600 sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Leaderboards
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Track the global race, see your current position, and keep up
                with the prediction groups that matter most.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                {badges.map((badge, index) => (
                    <span
                        key={badge}
                        className={
                            index === 0
                                ? 'rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-slate-600'
                                : 'rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600'
                        }
                    >
                        {badge}
                    </span>
                ))}
            </div>
            <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                <Link
                    href={matches.url()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <CalendarDays className="size-4" />
                    Make predictions
                </Link>
                <Link
                    href={scoringGuideHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <Calculator className="size-4" />
                    How scoring works
                </Link>
            </div>
        </section>
    );
}
