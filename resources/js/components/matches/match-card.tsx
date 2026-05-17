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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
            <MatchStatusBadges match={match} />
            <MatchSummary match={match} />
            <MatchDetailsToggle
                expanded={showDetails}
                onToggle={() => setShowDetails((current) => !current)}
            />
            {showDetails && <MatchDetailsPanel match={match} />}
        </div>
    );
}
