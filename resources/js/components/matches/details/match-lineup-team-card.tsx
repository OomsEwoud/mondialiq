import MatchLineupPlayerGroup from '@/components/matches/details/match-lineup-player-group';
import type {
    MatchDetailsLineupTeam,
    MatchDetailsTeam,
} from '@/types/match-details';

type Props = {
    team: MatchDetailsTeam;
    lineup: MatchDetailsLineupTeam;
};

export default function MatchLineupTeamCard({ team, lineup }: Props) {
    return (
        <section className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="size-8 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-blue-950">
                            {team.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-400">
                            Formation
                        </p>
                    </div>
                </div>
                <span className="rounded-md border border-blue-100 bg-white px-2.5 py-1 text-xs font-black text-blue-700">
                    {lineup.formation ?? '-'}
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-4">
                <MatchLineupPlayerGroup
                    title="Starting XI"
                    players={lineup.starters}
                    isStarting
                />
                <MatchLineupPlayerGroup
                    title="Substitutes"
                    players={lineup.substitutes}
                />
            </div>
        </section>
    );
}
