import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ActivePlayersGrid from '@/components/teams/active-players-grid';
import TeamCoachCard from '@/components/teams/team-coach-card';
import TeamHero from '@/components/teams/team-hero';
import TeamInfoCard from '@/components/teams/team-info-card';
import { matches } from '@/routes';
import type { TeamDetails as TeamDetailsType } from '@/types/team-details';

interface Props {
    team: TeamDetailsType;
}

export default function TeamDetails({ team }: Props) {
    return (
        <>
            <Head title={team.name} />

            <div className="mb-5">
                <Link
                    href={matches.url()}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to matches
                </Link>
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
