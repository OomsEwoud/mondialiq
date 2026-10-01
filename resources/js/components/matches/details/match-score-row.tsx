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
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm">
            <span className="text-sm font-bold text-muted-foreground">
                {label}
            </span>
            <span className="font-bold text-foreground">{value}</span>
        </div>
    );
}
