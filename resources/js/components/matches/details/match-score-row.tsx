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
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="font-black text-blue-950">{value}</span>
        </div>
    );
}
