import BackButton from '@/components/navigation/back-button';
import PageHead from '@/components/seo/page-head';
import ActivePlayersGrid from '@/components/teams/active-players-grid';
import TeamCoachCard from '@/components/teams/team-coach-card';
import TeamHero from '@/components/teams/team-hero';
import TeamInfoCard from '@/components/teams/team-info-card';
import type { TeamDetails as TeamDetailsType } from '@/types/team-details';

interface Props {
    team: TeamDetailsType;
}

export default function TeamDetails({ team }: Props) {
    return (
        <>
            <PageHead
                title={team.name}
                description={`Bekijk ${team.name}, de bondscoach en de actieve WK-selectie op MondialIQ.`}
            />

            <div className="flex w-full flex-col gap-8">
                <BackButton className="w-fit" />
                <TeamHero team={team} />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <TeamInfoCard team={team} />
                    <TeamCoachCard coach={team.coach} />
                </div>
                <ActivePlayersGrid players={team.activePlayers} />
            </div>
        </>
    );
}
