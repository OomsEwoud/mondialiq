import { Gauge, PencilLine, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import { Button } from '@/components/ui/forms/button';
import type { Match } from '@/types/match';
import {
    aiPredictionScoreLabel,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
    mode: PredictionTab;
}

export default function PredictionDetailHero({ match, mode }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const isAiPrediction = mode === 'ai';
    const activePrediction = isAiPrediction
        ? match.aiPrediction
        : (match.userPrediction ?? match.aiPrediction);
    const score =
        !isAiPrediction && match.userPrediction
            ? predictionScoreLabel(match)
            : aiPredictionScoreLabel(match);

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-black tracking-[0.24em] text-cyan-600 uppercase">
                                {isAiPrediction
                                    ? 'AI prediction'
                                    : 'My prediction'}
                            </p>
                            <h1 className="mt-1 text-2xl font-black text-blue-950 sm:text-3xl">
                                {match.homeTeam} vs {match.awayTeam}
                            </h1>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                {match.round}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-600">
                                {match.date} &middot; {match.time}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                                <UserPredictionTeam
                                    logo={match.homeTeamLogo}
                                    name={match.homeTeam}
                                    code={match.homeTeamShort}
                                />

                                <div className="text-center">
                                    <p className="text-[11px] font-black tracking-[0.24em] text-slate-400 uppercase">
                                        Predicted score
                                    </p>
                                    <p className="mt-2 text-3xl font-black text-blue-950">
                                        {score ?? '-'}
                                    </p>
                                </div>

                                <UserPredictionTeam
                                    logo={match.awayTeamLogo}
                                    name={match.awayTeam}
                                    code={match.awayTeamShort}
                                    align="right"
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3 text-left">
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                                        <Trophy className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                                            Predicted winner
                                        </p>
                                        <p className="mt-1 text-base font-bold text-blue-950">
                                            {activePrediction?.label}
                                        </p>
                                    </div>
                                </div>

                                {activePrediction?.confidence && (
                                    <div className="flex items-start gap-3 text-left">
                                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                                            <Gauge className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                                                Chance
                                            </p>
                                            <p className="mt-1 text-base font-bold text-blue-950 capitalize">
                                                {activePrediction.confidence}{' '}
                                                confidence
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isAiPrediction &&
                                    match.aiPrediction?.advice && (
                                        <div className="flex items-start gap-3 text-left">
                                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                                                <Sparkles className="size-4" />
                                            </span>
                                            <div>
                                                <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                                                    AI insight
                                                </p>
                                                <p className="mt-1 text-sm leading-6 font-medium text-slate-600">
                                                    {match.aiPrediction.advice}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </section>
                    </div>

                    {!isAiPrediction && match.userPrediction && (
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                                onClick={() => setPredictionOpen(true)}
                            >
                                <PencilLine className="h-4 w-4" />
                                Edit prediction
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {!isAiPrediction && match.userPrediction && (
                <UserPredictionModal
                    match={match}
                    open={predictionOpen}
                    onOpenChange={setPredictionOpen}
                />
            )}
        </>
    );
}
