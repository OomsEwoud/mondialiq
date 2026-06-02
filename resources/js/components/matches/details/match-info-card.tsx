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

    return (
        <section className="rounded-[1.8rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:p-6">
            <h2 className="mb-5 text-2xl font-black text-blue-950">
                Match info
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MatchInfoItem
                    icon={<CalendarDays />}
                    label="Date"
                    value={match.date}
                />
                <MatchInfoItem
                    icon={<Clock />}
                    label="Kickoff"
                    value={match.time}
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
                />
                <MatchInfoItem
                    icon={<UserRound />}
                    label="Referee"
                    value={match.referee ?? 'TBC'}
                />
            </div>
        </section>
    );
}
