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
                        <EventRow key={event.id} event={event} />
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

interface EventRowProps {
    event: MatchDetailsEvent;
}

function EventRow({ event }: EventRowProps) {
    const minute = event.extraTime
        ? `${event.minute}+${event.extraTime}'`
        : `${event.minute}'`;

    return (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <span className="w-12 shrink-0 text-sm font-black text-blue-600">
                {minute}
            </span>
            <img
                src={event.teamLogo}
                alt={event.team}
                className="h-7 w-7 shrink-0 object-contain"
            />
            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                    {event.detail}
                </p>
                <p className="truncate text-xs text-slate-500">
                    {[
                        event.player,
                        event.assist ? `Assist: ${event.assist}` : null,
                    ]
                        .filter(Boolean)
                        .join(' · ') || event.team}
                </p>
            </div>
        </div>
    );
}
