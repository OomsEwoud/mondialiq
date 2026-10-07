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
import { translateMatchStatus } from '@/utils/match-status';

interface Props {
    match: MatchDetails;
}

export default function MatchInfoCard({ match }: Props) {
    const venue = match.venue;
    const venueLabel = venue
        ? [venue.name, venue.city].filter(Boolean).join(', ')
        : 'Nog niet bekend';
    const seasonLabel = String(match.season);

    const timeLabel =
        !match.time || match.time === '00:00' || match.time === '00:00:00'
            ? 'Nog niet bekend'
            : match.time;

    return (
        <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
                Wedstrijdinformatie
            </h2>
            <div className="grid grid-cols-1 divide-y divide-border/60">
                <MatchInfoItem
                    icon={<CalendarDays />}
                    label="Datum"
                    value={match.date}
                />
                <MatchInfoItem
                    icon={<Clock />}
                    label="Aftrap"
                    value={timeLabel}
                />
                <MatchInfoItem
                    icon={<Trophy />}
                    label="Seizoen"
                    value={seasonLabel}
                />
                <MatchInfoItem
                    icon={<Shield />}
                    label="Status"
                    value={translateMatchStatus(match.status)}
                />
                <MatchInfoItem
                    icon={<MapPin />}
                    label="Stadion"
                    value={venueLabel}
                />
                <MatchInfoItem
                    icon={<UserRound />}
                    label="Scheidsrechter"
                    value={match.referee ?? 'Nog niet bekend'}
                />
            </div>
        </section>
    );
}
