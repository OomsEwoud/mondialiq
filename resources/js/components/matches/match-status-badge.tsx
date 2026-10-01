import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';
import { getMatchStatusKind, getMatchStatusLabel } from '@/utils/match-status';

interface Props {
    match: Match;
}

export default function MatchStatusBadge({ match }: Props) {
    const kind = getMatchStatusKind(match);

    if (kind === 'live') {
        return null;
    }

    return (
        <Badge
            className={cn(
                'border px-2.5 py-1 font-bold shadow-none',
                kind === 'finished' &&
                    'border-emerald-200 bg-emerald-950/40 text-emerald-200',
                kind === 'upcoming' && 'border-border bg-accent text-primary',
                kind === 'postponed' &&
                    'border-amber-200 bg-amber-950/40 text-amber-200',
                kind === 'cancelled' &&
                    'border-rose-200 bg-rose-950/40 text-rose-200',
                kind === 'unknown' &&
                    'border-border bg-muted text-muted-foreground',
            )}
        >
            {getMatchStatusLabel(match)}
        </Badge>
    );
}
