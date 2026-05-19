import { Trophy } from 'lucide-react';

export default function LeaderboardsPageHeader() {
    return (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm sm:mb-8 sm:px-8 sm:py-8">
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
        </section>
    );
}
