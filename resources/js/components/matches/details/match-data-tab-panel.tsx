import MatchDataEmptyState from '@/components/matches/details/match-data-empty-state';
import MatchEventsTimeline from '@/components/matches/details/match-events-timeline';
import MatchLineupsPanel from '@/components/matches/details/match-lineups-panel';
import MatchStatsPanel from '@/components/matches/details/match-stats-panel';
import type { MatchDetails } from '@/types/match-details';

export type MatchDataTab = 'events' | 'stats' | 'lineups';

interface Props {
    activeTab: MatchDataTab;
    match: MatchDetails;
}

export default function MatchDataTabPanel({ activeTab, match }: Props) {
    if (activeTab === 'events') {
        return match.events.length > 0 ? (
            <MatchEventsTimeline events={match.events} />
        ) : (
            <MatchDataEmptyState message="No match events available yet. Events will appear once the match starts." />
        );
    }

    if (activeTab === 'stats') {
        return match.stats.length > 0 ? (
            <MatchStatsPanel match={match} />
        ) : (
            <MatchDataEmptyState message="No match statistics available yet. Team stats will appear once data is available." />
        );
    }

    return <MatchLineupsPanel match={match} />;
}
