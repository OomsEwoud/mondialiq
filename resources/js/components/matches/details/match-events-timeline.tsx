import MatchEventTimelineItem from '@/components/matches/details/match-event-timeline-item';
import type { MatchDetailsEvent } from '@/types/match-details';

interface Props {
    events: MatchDetailsEvent[];
}

export default function MatchEventsTimeline({ events }: Props) {
    return (
        <div className="space-y-1">
            {events.map((event, index) => (
                <MatchEventTimelineItem
                    key={event.id}
                    event={event}
                    isFirst={index === 0}
                    isLast={index === events.length - 1}
                />
            ))}
        </div>
    );
}
