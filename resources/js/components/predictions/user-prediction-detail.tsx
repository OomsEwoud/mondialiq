import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Gauge,
    Goal,
    Lock,
    PencilLine,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';

import UserPredictionModal from '@/components/matches/prediction/user-prediction-modal';
import UserPredictionTeam from '@/components/matches/prediction/user-prediction-team';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';
import { show as showAiPrediction } from '@/routes/predictions/ai';
import type { Match } from '@/types/match';
import {
    hasMatchStarted,
    predictionScoreLabel,
} from '@/utils/match-prediction';

interface Props {
    match: Match;
}

type UserPredictionConfidence = NonNullable<
    Match['userPrediction']
>['confidence'];

export default function UserPredictionDetail({ match }: Props) {
    const [predictionOpen, setPredictionOpen] = useState(false);
    const prediction = match.userPrediction;
    const score = predictionScoreLabel(match);
    const matchStarted = hasMatchStarted(match);

    return (
        <>
            <div className="space-y-4 sm:space-y-5">
                <UserPredictionHero match={match} />
                <UserPredictedScoreCard match={match} score={score} />
                <UserPredictionSummaryCards match={match} score={score} />

                {match.hasAiPrediction ? (
                    <section className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-cyan-600 shadow-xs">
                                    <Sparkles className="size-5" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-base font-black text-blue-950">
                                        Compare with AI prediction
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-600">
                                        See how your pick lines up with the AI
                                        report for this match.
                                    </p>
                                </div>
                            </div>

                            <Button
                                asChild
                                className="justify-center bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950"
                            >
                                <Link href={showAiPrediction.url(match.id)}>
                                    View AI report
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </section>
                ) : null}

                <UserPredictionActions
                    locked={matchStarted}
                    onEdit={() => setPredictionOpen(true)}
                />
            </div>

            {prediction ? (
                <UserPredictionModal
                    match={match}
                    open={predictionOpen}
                    onOpenChange={setPredictionOpen}
                />
            ) : null}
        </>
    );
}

function UserPredictionHero({ match }: { match: Match }) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-cyan-50 via-white to-blue-50 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-black tracking-[0.28em] text-cyan-600 uppercase">
                            My Prediction
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
                        <Trophy className="size-4 text-cyan-500" />
                        {match.status || match.round}
                    </div>
                </div>
            </div>
        </section>
    );
}

function UserPredictedScoreCard({
    match,
    score,
}: {
    match: Match;
    score: string | null;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-[1fr] gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <UserPredictionTeam
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                    code={match.homeTeamShort}
                />

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                    <p className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Your predicted score
                    </p>
                    <p
                        className={cn(
                            'mt-2 font-black text-blue-950',
                            score ? 'text-4xl' : 'text-xl',
                        )}
                    >
                        {score ?? 'No score predicted'}
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
    );
}

function UserPredictionSummaryCards({
    match,
    score,
}: {
    match: Match;
    score: string | null;
}) {
    const prediction = match.userPrediction;
    const confidence = formatConfidenceLabel(prediction?.confidence ?? null);

    return (
        <section className="grid gap-3 md:grid-cols-3">
            <SummaryCard
                icon={Trophy}
                label="Predicted outcome"
                value={formatPredictedOutcome(prediction?.label)}
            />
            <SummaryCard
                icon={Gauge}
                label="Confidence"
                value={confidence.value}
                helper={confidence.helper}
            />
            <SummaryCard
                icon={Goal}
                label="Predicted score"
                value={score ?? 'No score predicted'}
            />
        </section>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    helper,
}: {
    icon: typeof Trophy;
    label: string;
    value: string;
    helper?: string;
}) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-100 text-cyan-700">
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-black tracking-[0.18em] text-slate-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-lg leading-tight font-black text-blue-950">
                        {value}
                    </p>
                    {helper ? (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            {helper}
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function UserPredictionActions({
    locked,
    onEdit,
}: {
    locked: boolean;
    onEdit: () => void;
}) {
    return (
        <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
                <h2 className="text-base font-black text-blue-950">
                    Your pick
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {locked
                        ? 'This prediction is locked because the match has started.'
                        : 'You can still adjust your prediction before kickoff.'}
                </p>
            </div>

            <Button
                type="button"
                disabled={locked}
                className={cn(
                    'justify-center',
                    locked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950',
                )}
                onClick={onEdit}
            >
                {locked ? (
                    <>
                        <Lock className="size-4" />
                        Prediction locked
                    </>
                ) : (
                    <>
                        <PencilLine className="size-4" />
                        Edit prediction
                    </>
                )}
            </Button>
        </section>
    );
}

function formatPredictedOutcome(label: string | null | undefined): string {
    return label ?? 'Outcome not selected';
}

function formatConfidenceLabel(confidence: UserPredictionConfidence): {
    value: string;
    helper?: string;
} {
    if (!confidence) {
        return { value: 'Confidence not provided' };
    }

    return {
        value: `${capitalize(confidence)} confidence`,
        helper: 'Your selected confidence level',
    };
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
