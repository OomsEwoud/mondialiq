import { CalendarDays, Clock, Flag } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailMeta({ match }: Props) {
    return (
        <div className="mt-5 grid grid-cols-1 gap-2 border-t border-border-subtle pt-5 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2">
                <Flag className="h-4 w-4 text-primary" />
                <span className="font-semibold text-text-secondary">
                    {match.round}
                </span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="font-semibold text-text-secondary">
                    {match.date}
                </span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold text-text-secondary">
                    {match.time}
                </span>
            </div>
        </div>
    );
}
