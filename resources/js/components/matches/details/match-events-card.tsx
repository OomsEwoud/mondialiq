import MatchEventRow from '@/components/matches/details/match-event-row';
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
                <div className="flex flex-col gap-3">
                    {events.map((event) => (
                        <MatchEventRow key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No match events available yet.
                </p>
            )}
        </section>
    );
}
