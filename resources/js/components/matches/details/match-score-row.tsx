import type { MatchDetailsScoreLine } from '@/types/match-details';

interface Props {
    label: string;
    score: MatchDetailsScoreLine;
}

export default function MatchScoreRow({ label, score }: Props) {
    const value =
        score.home === null || score.away === null
            ? 'Not available'
            : `${score.home} - ${score.away}`;

    return (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <span className="font-bold text-slate-900">{value}</span>
        </div>
    );
}
