import type { MatchDetailsScoreLine } from '@/types/match-details';

interface Props {
    label: string;
    score: MatchDetailsScoreLine;
}

export default function MatchScoreRow({ label, score }: Props) {
    const value =
        score.home === null || score.away === null
            ? 'Nog niet beschikbaar'
            : `${score.home} - ${score.away}`;

    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground tabular-nums">
                {value}
            </span>
        </div>
    );
}
