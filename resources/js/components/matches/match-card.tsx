import { CalendarDays, Clock, Trophy } from 'lucide-react';
import { useState } from 'react';
import MatchDetailsPanel from '@/components/matches/match-details-panel';
import MatchDetailsToggle from '@/components/matches/match-details-toggle';
import MatchStatusBadges from '@/components/matches/match-status-badges';
import MatchSummary from '@/components/matches/match-summary';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchCard({ match }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-blue-950/5 transition-all hover:shadow-md sm:p-5">
            <MatchSummary match={match} />
            <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <Trophy className="size-3.5 shrink-0 text-cyan-600/80" />
                        <span className="truncate">{match.round}</span>
                    </span>
                    <span className="hidden text-slate-300 sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-cyan-600/80" />
                        {match.date}
                    </span>
                    <span className="hidden text-slate-300 sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-cyan-600/80" />
                        {match.time}
                    </span>
                </div>
                <MatchStatusBadges match={match} />
            </div>
            <MatchDetailsToggle
                expanded={showDetails}
                onToggle={() => setShowDetails((current) => !current)}
            />
            {showDetails && <MatchDetailsPanel match={match} />}
        </article>
    );
}
