import { Sparkles } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function AiPredictionHero({ match }: Props) {
    const status = match.status || match.round;

    return (
        <section className="overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.2),transparent_24rem),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef7ff_100%)] shadow-2xl shadow-cyan-950/8">
            <div className="px-5 py-6 sm:px-7 sm:py-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-black tracking-[0.28em] text-cyan-700 uppercase">
                            AI Prediction Report
                        </p>
                        <h1 className="mt-3 text-3xl leading-tight font-black text-blue-950 sm:text-5xl">
                            {match.homeTeam} vs {match.awayTeam}
                        </h1>
                        <p className="mt-4 text-sm font-semibold text-slate-600">
                            {match.round} &middot; {match.date} &middot;{' '}
                            {match.time}
                        </p>
                        <p className="mt-3 max-w-2xl text-sm leading-7 font-medium text-slate-600 sm:text-base">
                            Model-generated match insight based on available
                            data signals.
                        </p>
                    </div>

                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-cyan-100 bg-white px-4 py-2.5 text-xs font-black tracking-[0.16em] text-blue-950 uppercase shadow-lg shadow-cyan-950/6">
                        <Sparkles className="size-4 text-cyan-600" />
                        {status}
                    </div>
                </div>
            </div>
        </section>
    );
}
