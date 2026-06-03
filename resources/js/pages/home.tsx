import HeroSection from '@/components/home/hero-section';
import LiveMatches from '@/components/home/live-matches';
import PlatformOverview from '@/components/home/platform-overview';
import UpcomingMatches from '@/components/home/upcoming-matches';
import PageHead from '@/components/seo/page-head';
import type { LiveFixture } from '@/types/live-fixture';
import type { UpcomingMatch } from '@/types/match';

interface Props {
    upcomingFixtures: UpcomingMatch[];
    liveFixtures: LiveFixture[];
}

export default function Home({ upcomingFixtures, liveFixtures }: Props) {
    return (
        <>
            <PageHead
                title="MondialIQ - AI World Cup 2026 Predictions"
                description="MondialIQ combines AI match insights, World Cup 2026 fixtures, user predictions and private leaderboards in one football prediction platform."
            />

            <div className="relative left-1/2 w-screen -translate-x-1/2">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:gap-8 lg:px-8 lg:py-8">
                    <HeroSection />
                    <PlatformOverview />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <UpcomingMatches matches={upcomingFixtures} />
                        <LiveMatches initialMatches={liveFixtures} />
                    </div>
                </div>
            </div>
        </>
    );
}
