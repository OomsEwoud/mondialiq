import HeroSection from "@/components/home/hero-section";
import LiveMatches from "@/components/home/live-matches";
import UpcomingMatches from "@/components/home/upcoming-matches";
import type { Match } from "@/types/match";

interface Props {
    upcomingFixtures : Match[];
}

const mockLive = [
    { id: 1, home: 'GER', away: 'ESP', homeScore: 1, awayScore: 1, minute: 67 },
    { id: 2, home: 'FRA', away: 'POR', homeScore: 2, awayScore: 0, minute: 82 },
    { id: 3, home: 'NED', away: 'ENG', homeScore: 0, awayScore: 0, minute: 14 },
];

export default function home({upcomingFixtures}: Props) {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <HeroSection />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UpcomingMatches matches={upcomingFixtures} />
                <LiveMatches matches={mockLive} />
            </div>
        </div>
    );
}
