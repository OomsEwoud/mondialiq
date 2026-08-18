import type { LiveFixture } from './live-fixture';
import type { Match } from './match';

export type DashboardCompetition = {
    id: number;
    name: string;
    logoUrl: string | null;
};

export type DashboardProps = {
    upcomingFixtures: Match[];
    liveFixtures: LiveFixture[];
    recentFixtures: Match[];
    competitions: DashboardCompetition[];
};
