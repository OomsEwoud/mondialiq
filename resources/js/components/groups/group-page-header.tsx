import { Trophy } from 'lucide-react';

const pageHeaderClassName =
    'mx-auto mb-5 max-w-7xl overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.22),transparent_24rem),linear-gradient(135deg,#0b1748_0%,#14236f_58%,#0e7490_150%)] p-6 text-center shadow-2xl shadow-blue-950/15 sm:mb-6 sm:p-8';

export default function GroupPageHeader() {
    return (
        <section className={pageHeaderClassName}>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-100 backdrop-blur sm:size-14">
                <Trophy size={22} />
            </div>
            <p className="text-xs font-black tracking-[0.24em] text-cyan-100 uppercase">
                World Cup 2026
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Group Standings
            </h1>
        </section>
    );
}
