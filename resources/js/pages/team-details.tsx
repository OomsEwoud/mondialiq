import { Head } from '@inertiajs/react';
import BackButton from '@/components/navigation/back-button';
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
            <Head title={team.name} />

            <div className="mb-5">
                <BackButton />
            </div>

            <div className="flex flex-col gap-5">
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
