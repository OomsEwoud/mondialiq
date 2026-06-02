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
        <article className="group rounded-[1.7rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-4 shadow-lg shadow-cyan-950/6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/10 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid min-w-0 gap-4">
                    <span
                        className={
                            isMine
                                ? 'w-fit rounded-full border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-slate-700 uppercase'
                                : 'w-fit rounded-full border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-[11px] font-black tracking-[0.16em] text-cyan-800 uppercase'
                        }
                    >
                        {isMine ? 'Personal pick' : 'AI report'}
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
