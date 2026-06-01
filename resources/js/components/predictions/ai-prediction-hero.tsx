import { Sparkles } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function AiPredictionHero({ match }: Props) {
    const status = match.status || match.round;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-cyan-50/70 via-slate-50 to-white px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-black tracking-[0.28em] text-cyan-600 uppercase">
                            AI Prediction Report
                        </p>
                        <h1 className="mt-2 text-2xl leading-tight font-black text-blue-950 sm:text-3xl">
                            {match.homeTeam} vs {match.awayTeam}
                        </h1>
                        <p className="mt-3 text-sm font-medium text-slate-600">
                            {match.round} &middot; {match.date} &middot;{' '}
                            {match.time}
                        </p>
                        <p className="mt-2 max-w-2xl text-sm leading-6 font-medium text-slate-600">
                            Model-generated match insight based on available
                            data signals.
                        </p>
                    </div>

                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black tracking-[0.14em] text-blue-950 uppercase shadow-xs">
                        <Sparkles className="size-4 text-cyan-500" />
                        {status}
                    </div>
                </div>
            </div>
        </section>
    );
}
