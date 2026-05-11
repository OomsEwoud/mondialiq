import {
    CalendarDays,
    Clock,
    MapPin,
    Shield,
    Trophy,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchInfoCard({ match }: Props) {
    const venue = match.venue;

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Match info
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem
                    icon={<CalendarDays />}
                    label="Date"
                    value={match.date}
                />
                <InfoItem icon={<Clock />} label="Kickoff" value={match.time} />
                <InfoItem
                    icon={<Trophy />}
                    label="Season"
                    value={String(match.season)}
                />
                <InfoItem
                    icon={<Shield />}
                    label="Status"
                    value={match.status}
                />
                <InfoItem
                    icon={<MapPin />}
                    label="Venue"
                    value={
                        venue
                            ? [venue.name, venue.city]
                                  .filter(Boolean)
                                  .join(', ')
                            : 'TBC'
                    }
                />
                <InfoItem
                    icon={<UserRound />}
                    label="Referee"
                    value={match.referee ?? 'TBC'}
                />
            </div>
        </section>
    );
}

interface InfoItemProps {
    icon: ReactNode;
    label: string;
    value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="truncate text-sm font-bold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
