import HeroSection from "@/components/home/hero-section";
import LiveMatches from "@/components/home/live-matches";
import UpcomingMatches from "@/components/home/upcoming-matches";

const mockUpcoming = [
    { id: 1, home: 'USA', away: 'MEX', date: 'Jun 12', time: '15:00' },
    { id: 2, home: 'CAN', away: 'URU', date: 'Jun 12', time: '18:00' },
    { id: 3, home: 'BRA', away: 'ARG', date: 'Jun 13', time: '20:00' },
];

const mockLive = [
    { id: 1, home: 'GER', away: 'ESP', homeScore: 1, awayScore: 1, minute: 67 },
    { id: 2, home: 'FRA', away: 'POR', homeScore: 2, awayScore: 0, minute: 82 },
    { id: 3, home: 'NED', away: 'ENG', homeScore: 0, awayScore: 0, minute: 14 },
];

export default function home() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <HeroSection />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <UpcomingMatches matches={mockUpcoming} />
                <LiveMatches matches={mockLive} />
            </div>
        </div>
    );
}
