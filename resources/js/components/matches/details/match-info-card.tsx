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

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black text-blue-950">
                Match info
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    value={String(match.season)}
                />
                <MatchInfoItem
                    icon={<Shield />}
                    label="Status"
                    value={match.status}
                />
                <MatchInfoItem
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
                <MatchInfoItem
                    icon={<UserRound />}
                    label="Referee"
                    value={match.referee ?? 'TBC'}
                />
            </div>
        </section>
    );
}
