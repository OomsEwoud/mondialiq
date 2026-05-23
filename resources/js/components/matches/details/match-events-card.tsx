import MatchEventsTimeline from '@/components/matches/details/match-events-timeline';
import type { MatchDetailsEvent } from '@/types/match-details';

interface Props {
    events: MatchDetailsEvent[];
}

export default function MatchEventsCard({ events }: Props) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Match events
            </h2>
            {events.length > 0 ? (
                <MatchEventsTimeline events={events} />
            ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
                    No match events available yet.
                </div>
            )}
        </section>
    );
}
