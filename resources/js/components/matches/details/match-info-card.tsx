import {
    CalendarDays,
    Clock,
    MapPin,
    Shield,
    Trophy,
    UserRound,
} from 'lucide-react';
import MatchInfoItem from '@/components/matches/details/match-info-item';
import type { MatchDetails } from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchInfoCard({ match }: Props) {
    const venue = match.venue;
    const venueLabel = venue
        ? [venue.name, venue.city].filter(Boolean).join(', ')
        : 'TBC';
    const seasonLabel = String(match.season);

    const timeLabel =
        !match.time || match.time === '00:00' || match.time === '00:00:00'
            ? 'TBD'
            : match.time;

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
                Match info
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MatchInfoItem
                    icon={<CalendarDays />}
                    label="Date"
                    value={match.date}
                />
                <MatchInfoItem
                    icon={<Clock />}
                    label="Kickoff"
                    value={timeLabel}
                />
                <MatchInfoItem
                    icon={<Trophy />}
                    label="Season"
                    value={seasonLabel}
                />
                <MatchInfoItem
                    icon={<Shield />}
                    label="Status"
                    value={match.status}
                />
                <MatchInfoItem
                    icon={<MapPin />}
                    label="Venue"
                    value={venueLabel}
                    className="md:col-span-2"
                />
                <MatchInfoItem
                    icon={<UserRound />}
                    label="Referee"
                    value={match.referee ?? 'TBC'}
                    className="md:col-span-2"
                />
            </div>
        </section>
    );
}
