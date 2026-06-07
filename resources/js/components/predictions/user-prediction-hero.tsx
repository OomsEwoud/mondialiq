import { Trophy } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function UserPredictionHero({ match }: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 shadow-sm">
            <div className="px-5 py-6 sm:px-7 sm:py-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                            My Prediction
                        </p>
                        <h1 className="mt-3 text-3xl leading-tight font-bold text-slate-900 sm:text-5xl">
                            {match.homeTeam} vs {match.awayTeam}
                        </h1>
                        <p className="mt-4 text-sm font-semibold text-slate-600">
                            {match.round} &middot; {match.date} &middot;{' '}
                            {match.time}
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold tracking-wide text-slate-900 uppercase shadow-sm">
                        <Trophy className="size-4 text-slate-600" />
                        {match.status || match.round}
                    </div>
                </div>
            </div>
        </section>
    );
}
