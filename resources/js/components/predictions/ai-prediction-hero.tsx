import { Sparkles } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function AiPredictionHero({ match }: Props) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-cyan-50 via-white to-blue-50 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-black tracking-[0.28em] text-cyan-600 uppercase">
                            AI Prediction Report
                        </p>
                        <h1 className="mt-2 text-2xl leading-tight font-black text-blue-950 sm:text-3xl">
                            {match.homeTeam} vs {match.awayTeam}
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {match.round} &middot; {match.date} &middot;{' '}
                            {match.time}
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-xs font-black tracking-[0.18em] text-blue-950 uppercase shadow-xs">
                        <Sparkles className="size-4 text-cyan-500" />
                        {match.status || match.round}
                    </div>
                </div>
            </div>
        </section>
    );
}
