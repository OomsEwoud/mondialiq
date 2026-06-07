import { Trophy } from 'lucide-react';

const pageHeaderClassName =
    'mx-auto mb-5 max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:mb-6 sm:p-8';

export default function GroupPageHeader() {
    return (
        <section className={pageHeaderClassName}>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600 sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Group Standings
            </h1>
        </section>
    );
}
