import MatchEventsTimeline from '@/components/matches/details/match-events-timeline';
import type { MatchDetailsEvent } from '@/types/match-details';

interface Props {
    events: MatchDetailsEvent[];
}

export default function MatchEventsCard({ events }: Props) {
    const hasEvents = events.length > 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
                Match events
            </h2>
            {hasEvents ? (
                <MatchEventsTimeline events={events} />
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm font-medium text-slate-500">
                    No match events available yet.
                </div>
            )}
        </section>
    );
}
