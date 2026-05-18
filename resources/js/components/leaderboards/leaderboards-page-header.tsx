import { Trophy } from 'lucide-react';

export default function LeaderboardsPageHeader() {
    return (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm sm:mb-8 sm:p-8">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 sm:size-12">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-bold text-cyan-600 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-1 text-3xl font-black text-blue-950 sm:text-4xl md:text-5xl">
                Leaderboards
            </h1>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
                See who is leading the predictions race right now.
            </p>
        </section>
    );
}
