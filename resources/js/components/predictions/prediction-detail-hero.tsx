import { Gauge, PencilLine, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import { predictionAccent } from '@/components/predictions/prediction-variants';
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
    const accent = predictionAccent[isAiPrediction ? 'ai' : 'user'];
    const userPrediction = match.userPrediction;
    const aiPrediction = match.aiPrediction;
    const activePrediction = isAiPrediction
        ? aiPrediction
        : (userPrediction ?? aiPrediction);
    const score =
        !isAiPrediction && userPrediction
            ? predictionScoreLabel(match)
            : aiPredictionScoreLabel(match);
    const headerLabel = isAiPrediction ? 'AI prediction' : 'My prediction';
    const activePredictionLabel = activePrediction?.label ?? 'Not available';
    const activePredictionConfidence = activePrediction?.confidence;
    const showAiInsight = Boolean(isAiPrediction && aiPrediction?.advice);
    const showEditAction = Boolean(!isAiPrediction && userPrediction);
    const openPredictionModal = () => setPredictionOpen(true);

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                    className={`border-b border-slate-100 px-5 py-4 sm:px-6 ${
                        isAiPrediction
                            ? 'bg-linear-to-r from-cyan-50 via-white to-blue-50'
                            : 'bg-linear-to-r from-indigo-50 via-white to-violet-50'
                    }`}
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                {headerLabel}
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {match.homeTeam} vs {match.awayTeam}
                            </h1>
                        </div>

                        <div className="text-left sm:text-right">
                            <p
                                className={`text-xs font-semibold tracking-wide uppercase ${accent.text}`}
                            >
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
                                    <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                        Predicted score
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">
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
                                    <span
                                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${accent.iconWrapRound}`}
                                    >
                                        <Trophy className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                            Predicted winner
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {activePredictionLabel}
                                        </p>
                                    </div>
                                </div>

                                {activePredictionConfidence && (
                                    <div className="flex items-start gap-3 text-left">
                                        <span
                                            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${accent.iconWrapRound}`}
                                        >
                                            <Gauge className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                Chance
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-slate-900 capitalize">
                                                {activePredictionConfidence}{' '}
                                                confidence
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {showAiInsight && (
                                    <div className="flex items-start gap-3 text-left">
                                        <span
                                            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${accent.iconWrapRound}`}
                                        >
                                            <Sparkles className="size-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                AI insight
                                            </p>
                                            <p className="mt-1 text-sm leading-6 font-medium text-slate-600">
                                                {aiPrediction?.advice}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {showEditAction && (
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                className={`justify-center ${accent.bg} border ${accent.border} ${accent.text} hover:opacity-90`}
                                onClick={openPredictionModal}
                            >
                                <PencilLine className="h-4 w-4" />
                                Edit prediction
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {showEditAction && (
                <UserPredictionModal
                    match={match}
                    open={predictionOpen}
                    onOpenChange={setPredictionOpen}
                />
            )}
        </>
    );
}
