import { Shirt } from 'lucide-react';

import { cn } from '@/lib/utils';
import type {
    MatchDetails,
    MatchDetailsLineupPlayer,
    MatchDetailsLineupTeam,
    MatchDetailsTeam,
} from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchLineupsPanel({ match }: Props) {
    const hasLineups =
        hasLineupData(match.lineups.home) || hasLineupData(match.lineups.away);

    if (!hasLineups) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                No lineups available yet for this match.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LineupTeamCard team={match.homeTeam} lineup={match.lineups.home} />
            <LineupTeamCard team={match.awayTeam} lineup={match.lineups.away} />
        </div>
    );
}

function LineupTeamCard({
    team,
    lineup,
}: {
    team: MatchDetailsTeam;
    lineup: MatchDetailsLineupTeam;
}) {
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
                <LineupPlayerGroup
                    title="Starting XI"
                    players={lineup.starters}
                    isStarting
                />
                <LineupPlayerGroup
                    title="Substitutes"
                    players={lineup.substitutes}
                />
            </div>
        </section>
    );
}

function LineupPlayerGroup({
    title,
    players,
    isStarting = false,
}: {
    title: string;
    players: MatchDetailsLineupPlayer[];
    isStarting?: boolean;
}) {
    return (
        <div>
            <h4 className="mb-2 text-[11px] font-black tracking-wide text-slate-400 uppercase">
                {title}
            </h4>
            {players.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {players.map((player) => (
                        <LineupPlayerItem
                            key={player.id}
                            player={player}
                            isStarting={isStarting}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-md border border-dashed border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    No players listed.
                </p>
            )}
        </div>
    );
}

function LineupPlayerItem({
    player,
    isStarting,
}: {
    player: MatchDetailsLineupPlayer;
    isStarting: boolean;
}) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-2 rounded-md border bg-white px-2.5 py-2 shadow-xs',
                isStarting ? 'border-blue-100' : 'border-slate-100',
            )}
        >
            <span
                className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                    isStarting
                        ? 'bg-blue-950 text-white'
                        : 'bg-slate-100 text-slate-500',
                )}
            >
                {player.number ?? <Shirt className="size-3.5" />}
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                    {player.name}
                </p>
                <p className="text-xs font-medium text-slate-400">
                    {player.position ?? 'Position unknown'}
                </p>
            </div>
        </div>
    );
}

function hasLineupData(lineup: MatchDetailsLineupTeam): boolean {
    return (
        Boolean(lineup.formation) ||
        lineup.starters.length > 0 ||
        lineup.substitutes.length > 0
    );
}
