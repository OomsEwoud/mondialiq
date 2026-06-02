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
                description={`Explore ${team.name} team details, coach information and active World Cup squad players on MondialIQ.`}
            />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:gap-6 lg:py-8">
                <BackButton className="w-fit rounded-2xl border border-cyan-100 bg-white/95 text-slate-700 shadow-lg shadow-cyan-950/6 hover:border-cyan-200 hover:bg-cyan-50/60 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300" />
                <TeamHero team={team} />
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <TeamInfoCard team={team} />
                    <TeamCoachCard coach={team.coach} />
                </div>
                <ActivePlayersGrid players={team.activePlayers} />
            </div>
        </>
    );
}
