import type { PredictionMatch } from '@/types/prediction';

interface Props {
    match: PredictionMatch;
}

export default function PredictionMatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex min-w-0 items-center gap-3">
                <TeamCode code={match.homeCode} />
                <span className="text-xs font-black text-slate-300">VS</span>
                <TeamCode code={match.awayCode} />
            </div>

            <div className="text-left">
                <p className="text-xs text-slate-400">{match.round}</p>
                <p className="text-sm font-medium text-slate-600">
                    {match.date} &middot; {match.time}
                </p>
            </div>
        </div>
    );
}

function TeamCode({ code }: { code: string }) {
    return (
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
            {code}
        </span>
    );
}
