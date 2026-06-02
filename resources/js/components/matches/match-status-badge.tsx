import { Badge } from '@/components/ui/feedback/badge';
import { cn } from '@/lib/utils';
import type { Match } from '@/types/match';
import { getMatchStatusKind, getMatchStatusLabel } from '@/utils/match-status';

interface Props {
    match: Match;
}

export default function MatchStatusBadge({ match }: Props) {
    const kind = getMatchStatusKind(match);

    return (
        <Badge
            className={cn(
                'border px-2.5 py-1 font-black shadow-none',
                kind === 'finished' &&
                    'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.85))] text-emerald-800',
                kind === 'upcoming' &&
                    'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.85))] text-cyan-800',
                kind === 'live' &&
                    'border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,1),rgba(254,202,202,0.82))] text-red-700',
                kind === 'postponed' &&
                    'border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(253,230,138,0.7))] text-amber-800',
                kind === 'cancelled' &&
                    'border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1),rgba(254,205,211,0.8))] text-rose-700',
                kind === 'unknown' &&
                    'border-slate-200 bg-slate-50 text-slate-700',
            )}
        >
            {getMatchStatusLabel(match)}
        </Badge>
    );
}
