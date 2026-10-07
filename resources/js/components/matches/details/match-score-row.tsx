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
        <div className="relative flex items-center justify-between gap-3 py-3 before:absolute before:top-0 before:left-0 before:h-full before:w-px before:bg-border">
            <span className="pl-4 text-sm text-muted-foreground">{label}</span>
            <span className="font-semibold text-foreground tabular-nums">
                {value}
            </span>
        </div>
    );
}
