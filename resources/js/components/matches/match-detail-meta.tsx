import { CalendarDays, Clock, Flag } from 'lucide-react';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchDetailMeta({ match }: Props) {
    return (
        <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <Flag className="h-4 w-4 text-cyan-600/80" />
                <span>{match.round}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-cyan-600/80" />
                <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <Clock className="h-4 w-4 text-cyan-600/80" />
                <span>{match.time}</span>
            </div>
        </div>
    );
}
