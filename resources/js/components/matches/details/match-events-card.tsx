import MatchEventsTimeline from '@/components/matches/details/match-events-timeline';
import type { MatchDetailsEvent } from '@/types/match-details';

interface Props {
    events: MatchDetailsEvent[];
}

export default function MatchEventsCard({ events }: Props) {
    const hasEvents = events.length > 0;

    return (
        <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/70 p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-bold text-foreground">
                Match events
            </h2>
            {hasEvents ? (
                <MatchEventsTimeline events={events} />
            ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                    No match events available yet.
                </div>
            )}
        </section>
    );
}
