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
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                kind === 'upcoming' &&
                    'border-cyan-200 bg-cyan-50 text-cyan-700',
                kind === 'postponed' &&
                    'border-amber-200 bg-amber-50 text-amber-700',
                kind === 'cancelled' &&
                    'border-rose-200 bg-rose-50 text-rose-700',
                kind === 'unknown' &&
                    'border-slate-200 bg-slate-50 text-slate-600',
            )}
        >
            {getMatchStatusLabel(match)}
        </Badge>
    );
}
