import { CalendarDays, Clock, Flag } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailMeta({ match }: Props) {
    return (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:grid-cols-3">
            <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-blue-600" />
                <span>{match.round}</span>
            </div>
            <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{match.time}</span>
            </div>
        </div>
    );
}
