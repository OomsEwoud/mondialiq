import { Trophy } from 'lucide-react';

export default function GroupPageHeader() {
    return (
        <section className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900 px-6 py-8 text-center shadow-lg sm:mb-8 sm:px-8 sm:py-10">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-800 text-cyan-300 sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Group Standings
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Track every group&apos;s points, goal difference and
                qualification status as the tournament unfolds.
            </p>
        </section>
    );
}
