import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, PencilLine, Sparkles, Trophy } from 'lucide-react';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    hasUserPrediction: boolean;
    onPredictionClick: () => void;
}

export default function AiPredictionHero({
    match,
    hasUserPrediction,
    onPredictionClick,
}: Props) {
    return (
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-lg sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs font-semibold tracking-wide text-cyan-300 uppercase">
                    AI Prediction Report
                </p>
                <button
                    type="button"
                    onClick={onPredictionClick}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                >
                    <PencilLine className="size-4" />
                    {hasUserPrediction ? 'Edit prediction' : 'Make prediction'}
                </button>
            </div>

            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
                <Link
                    href={showTeam.url(match.homeTeamId)}
                    className="group flex flex-col items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50"
                >
                    <img
                        src={match.homeTeamLogo}
                        alt={match.homeTeam}
                        className="size-16 shrink-0 object-contain"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300">
                        {match.homeTeamShort}
                    </span>
                </Link>

                <div className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-600/50 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-cyan-300">
                        <Sparkles className="size-3.5" />
                        AI Analysis
                    </span>
                    <p className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                        vs
                    </p>
                </div>

                <Link
                    href={showTeam.url(match.awayTeamId)}
                    className="group flex flex-col items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50"
                >
                    <img
                        src={match.awayTeamLogo}
                        alt={match.awayTeam}
                        className="size-16 shrink-0 object-contain"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300">
                        {match.awayTeamShort}
                    </span>
                </Link>
            </div>

            <h1 className="mt-5 text-center text-2xl font-bold text-white sm:text-3xl">
                {match.homeTeam} vs {match.awayTeam}
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                    <Trophy className="size-3.5 text-cyan-400" />
                    {match.round}
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-cyan-400" />
                    {match.date}
                </span>
                <span className="hidden text-slate-600 sm:inline">|</span>
                <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-cyan-400" />
                    {match.time}
                </span>
            </div>
        </section>
    );
}
