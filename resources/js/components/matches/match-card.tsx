import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { useState } from 'react';
import MatchDetailsPanel from '@/components/matches/match-details-panel';
import MatchDetailsToggle from '@/components/matches/match-details-toggle';
import MatchSummary from '@/components/matches/match-summary';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function MatchCard({ match }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <article className="rounded-lg border border-[#29312c] bg-[#111513] p-3 transition-colors hover:border-[#3d4941] sm:p-5">
            <MatchSummary match={match} />
            <div className="mt-3 flex flex-col gap-3 border-t border-[#29312c] pt-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[#89928c]">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <Trophy className="size-3.5 shrink-0 text-[#70b98e]" />
                        <span className="truncate">{match.round}</span>
                    </span>
                    <span className="hidden text-[#3c4540] sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-[#70b98e]" />
                        {match.date}
                    </span>
                    <span className="hidden text-[#3c4540] sm:inline">/</span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-[#70b98e]" />
                        {match.time}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#7f8882]">
                    <span
                        className="flex items-center gap-1.5"
                        title={
                            match.hasAiPrediction
                                ? 'Voorspelling beschikbaar'
                                : 'Voorspelling volgt'
                        }
                    >
                        <Sparkles
                            className={`size-3.5 ${match.hasAiPrediction ? 'text-[#70b98e]' : 'text-[#59615c]'}`}
                        />
                        {match.hasAiPrediction
                            ? 'Analyse klaar'
                            : 'Analyse volgt'}
                    </span>
                    <span
                        className="flex items-center gap-1.5"
                        title={
                            match.userPrediction
                                ? `Voorspeld: ${match.userPrediction.label}`
                                : 'Nog niet voorspeld'
                        }
                    >
                        <CheckCircle2
                            className={`size-3.5 ${match.userPrediction ? 'text-[#70b98e]' : 'text-[#59615c]'}`}
                        />
                        {match.userPrediction
                            ? `Jouw keuze: ${match.userPrediction.label}`
                            : 'Nog geen keuze'}
                    </span>
                </div>
            </div>
            <MatchDetailsToggle
                expanded={showDetails}
                onToggle={() => setShowDetails((current) => !current)}
            />
            {showDetails && <MatchDetailsPanel match={match} />}
        </article>
    );
}
