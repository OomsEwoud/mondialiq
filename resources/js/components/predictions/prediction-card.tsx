import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, Trophy } from 'lucide-react';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import PredictionUserActions from '@/components/predictions/prediction-user-actions';
import UserPredictionSummary from '@/components/predictions/user-prediction-summary';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';
import {
    aiPredictionScoreLabel,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    actionLabel: string;
    mode: PredictionTab;
}

export default function PredictionCard({ match, actionLabel, mode }: Props) {
    const isMine = mode === 'mine';
    const prediction = isMine ? match.userPrediction : match.aiPrediction;
    const rawScore = isMine
        ? predictionScoreLabel(match)
        : aiPredictionScoreLabel(match);
    const score = rawScore?.replace(/\s*-\s*/, ' - ');

    return (
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                    {isMine ? 'Personal pick' : 'AI report'}
                </span>
                <UserPredictionSummary match={match} aiMode={!isMine} />
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <Link
                            href={showTeam.url(match.homeTeamId)}
                            className="group flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                        >
                            <img
                                src={match.homeTeamLogo}
                                alt={match.homeTeam}
                                className="size-10 shrink-0 object-contain"
                            />
                            <span
                                className={cn(
                                    'text-base font-bold text-slate-900',
                                    isMine
                                        ? 'group-hover:text-indigo-700'
                                        : 'group-hover:text-cyan-700',
                                )}
                            >
                                {match.homeTeamShort}
                            </span>
                        </Link>
                        {score ? (
                            <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-sm font-bold whitespace-nowrap text-slate-800 shadow-sm">
                                {score}
                            </span>
                        ) : (
                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                vs
                            </span>
                        )}
                        <Link
                            href={showTeam.url(match.awayTeamId)}
                            className="group flex min-w-0 flex-row-reverse items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                        >
                            <img
                                src={match.awayTeamLogo}
                                alt={match.awayTeam}
                                className="size-10 shrink-0 object-contain"
                            />
                            <span
                                className={cn(
                                    'text-base font-bold text-slate-900',
                                    isMine
                                        ? 'group-hover:text-indigo-700'
                                        : 'group-hover:text-cyan-700',
                                )}
                            >
                                {match.awayTeamShort}
                            </span>
                        </Link>
                        {prediction?.confidence && (
                            <span className="ml-2 shrink-0 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                                {/^\d+$/.test(prediction.confidence)
                                    ? `${prediction.confidence}% confidence`
                                    : `${prediction.confidence} confidence`}
                            </span>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <Trophy className="size-3.5 shrink-0 text-cyan-600" />
                            {match.round}
                        </span>
                        <span className="hidden text-slate-300 sm:inline">
                            /
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-cyan-600" />
                            {match.date}
                        </span>
                        <span className="hidden text-slate-300 sm:inline">
                            /
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-cyan-600" />
                            {match.time}
                        </span>
                    </div>
                </div>

                {isMine ? (
                    <PredictionUserActions
                        match={match}
                        viewLabel={actionLabel}
                    />
                ) : (
                    <PredictionStatusAction
                        matchId={match.id}
                        label={actionLabel}
                    />
                )}
            </div>
        </article>
    );
}
