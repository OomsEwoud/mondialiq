import { Link } from '@inertiajs/react';
import { Calculator, Trophy } from 'lucide-react';

const leaderboardHeaderClassName =
    'mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm sm:mb-8 sm:px-8 sm:py-8';

interface Props {
    scoringGuideHref: string;
}

export default function LeaderboardsPageHeader({ scoringGuideHref }: Props) {
    return (
        <section className={leaderboardHeaderClassName}>
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-100">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-black tracking-[0.18em] text-cyan-600 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-1 text-3xl font-black text-blue-950 sm:text-4xl md:text-5xl">
                Leaderboards
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Track the global race, see your current position, and keep up
                with the friends leagues that matter most.
            </p>
            <div className="mt-5">
                <Link
                    href={scoringGuideHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-950/10 bg-blue-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Calculator className="size-4" />
                    How scoring works
                </Link>
            </div>
        </section>
    );
}
