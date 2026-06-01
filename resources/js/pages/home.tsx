import { Head } from '@inertiajs/react';
import HeroSection from '@/components/home/hero-section';
import LiveMatches from '@/components/home/live-matches';
import PlatformOverview from '@/components/home/platform-overview';
import UpcomingMatches from '@/components/home/upcoming-matches';
import type { UpcomingMatch } from '@/types/match';

interface Props {
    upcomingFixtures: UpcomingMatch[];
}

const mockLive = [
    { id: 1, home: 'GER', away: 'ESP', homeScore: 1, awayScore: 1, minute: 67 },
    { id: 2, home: 'FRA', away: 'POR', homeScore: 2, awayScore: 0, minute: 82 },
    { id: 3, home: 'NED', away: 'ENG', homeScore: 0, awayScore: 0, minute: 14 },
];

export default function Home({ upcomingFixtures }: Props) {
    return (
        <>
            <Head title="Home" />

            <div className="relative left-1/2 w-screen -translate-x-1/2">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:gap-8 lg:px-8 lg:py-8">
                    <HeroSection />
                    <PlatformOverview />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <UpcomingMatches matches={upcomingFixtures} />
                        <LiveMatches matches={mockLive} />
                    </div>
                </div>
            </div>
        </>
    );
}
