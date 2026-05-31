import PredictionMatchSummary from '@/components/predictions/prediction-match-summary';
import PredictionStatusAction from '@/components/predictions/prediction-status-action';
import type { PredictionTab } from '@/components/predictions/prediction-tabs';
import PredictionUserActions from '@/components/predictions/prediction-user-actions';
import UserPredictionSummary from '@/components/predictions/user-prediction-summary';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
    actionLabel: string;
    mode: PredictionTab;
}

export default function PredictionCard({ match, actionLabel, mode }: Props) {
    const isMine = mode === 'mine';

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 transition-all hover:shadow-md sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-4">
                    <span
                        className={
                            isMine
                                ? 'w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black tracking-widest text-slate-700 uppercase'
                                : 'w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-black tracking-widest text-cyan-700 uppercase'
                        }
                    >
                        {isMine ? 'Your pick' : 'AI model'}
                    </span>
                    <PredictionMatchSummary match={match} />
                    {isMine && <UserPredictionSummary match={match} />}
                    {!isMine && <UserPredictionSummary match={match} aiMode />}
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
