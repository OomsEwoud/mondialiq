import { Trophy } from 'lucide-react';

const pageHeaderClassName =
    'mx-auto mb-5 max-w-7xl rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:mb-6 sm:p-6';

export default function GroupPageHeader() {
    return (
        <section className={pageHeaderClassName}>
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 sm:size-12">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-black tracking-widest text-cyan-600 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Group Standings
            </h1>
        </section>
    );
}
