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
        <article className="rounded-[1.75rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-4 shadow-lg shadow-cyan-950/6 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-2xl hover:shadow-cyan-950/10 sm:p-6">
            <MatchSummary match={match} />
            <div className="mt-4 flex flex-col gap-3 border-t border-cyan-100/70 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs font-black text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <Trophy className="size-3.5 shrink-0 text-cyan-700" />
                        <span className="truncate">{match.round}</span>
                    </span>
                    <span className="hidden text-cyan-200 sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-cyan-700" />
                        {match.date}
                    </span>
                    <span className="hidden text-cyan-200 sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-cyan-700" />
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
