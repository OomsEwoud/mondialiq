import { Link } from '@inertiajs/react';
import { Calculator, CalendarDays, Trophy } from 'lucide-react';
import { matches } from '@/routes';

const leaderboardHeaderClassName =
    'mb-6 overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.22),transparent_24rem),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef7ff_100%)] p-6 text-center shadow-2xl shadow-cyan-950/8 sm:p-8';

interface Props {
    scoringGuideHref: string;
}

export default function LeaderboardsPageHeader({ scoringGuideHref }: Props) {
    const badges = ['Global ranking', 'Prediction groups', 'Scored out of 20'];

    return (
        <section className={leaderboardHeaderClassName}>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm ring-1 shadow-cyan-950/5 ring-cyan-100 sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-black tracking-[0.24em] text-cyan-700 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-blue-950 sm:text-5xl">
                Leaderboards
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Track the global race, see your current position, and keep up
                with the prediction groups that matter most.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {badges.map((badge, index) => (
                    <span
                        key={badge}
                        className={
                            index === 0
                                ? 'rounded-full border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-xs font-black text-cyan-700 shadow-sm shadow-cyan-950/5'
                                : 'rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm shadow-cyan-950/5'
                        }
                    >
                        {badge}
                    </span>
                ))}
            </div>
            <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                <Link
                    href={matches.url()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <CalendarDays className="size-4" />
                    Make predictions
                </Link>
                <Link
                    href={scoringGuideHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm shadow-cyan-950/5 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                    <Calculator className="size-4" />
                    How scoring works
                </Link>
            </div>
        </section>
    );
}
