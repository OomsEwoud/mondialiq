import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
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
    const sortedPlayers = sortPlayersByPosition(players);

    return (
        <div>
            <h4 className="mb-2 text-[11px] font-black tracking-wide text-slate-400 uppercase">
                {title}
            </h4>
            {sortedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {sortedPlayers.map((player) => (
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
    const getInitials = useInitials();

    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-2.5 rounded-md border bg-white px-2.5 shadow-xs',
                isStarting
                    ? 'border-blue-100 py-2.5'
                    : 'border-slate-100 bg-white/80 py-1.5 shadow-none',
            )}
        >
            <div className="relative shrink-0">
                <Avatar
                    className={cn(
                        'border border-white shadow-sm ring-1 ring-slate-200',
                        isStarting ? 'size-10' : 'size-9',
                    )}
                >
                    {player.photo ? (
                        <AvatarImage
                            src={player.photo}
                            alt={`${player.name} photo`}
                            className="object-cover"
                        />
                    ) : null}
                    <AvatarFallback className="bg-blue-950 text-[11px] font-black text-white">
                        {getInitials(player.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -right-1 -bottom-1 flex min-w-5 items-center justify-center rounded-full border border-white bg-slate-900 px-1 text-[10px] font-black text-white shadow-sm">
                    {player.number ?? '-'}
                </span>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="min-w-0 truncate text-sm font-bold text-slate-800"
                        title={player.name}
                    >
                        {player.name}
                    </p>
                    {player.isCaptain ? (
                        <span
                            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-950 text-[10px] font-black text-white"
                            title="Captain"
                            aria-label="Captain"
                        >
                            C
                        </span>
                    ) : null}
                </div>
                <span
                    className={cn(
                        'mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[11px] font-bold',
                        isStarting
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-slate-50 text-slate-400',
                    )}
                >
                    <span className="truncate">
                        {formatPositionLabel(player.position)}
                    </span>
                </span>
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

function formatPositionLabel(position: string | null): string {
    return position ?? 'Position unknown';
}

function sortPlayersByPosition(
    players: MatchDetailsLineupPlayer[],
): MatchDetailsLineupPlayer[] {
    return [...players].sort((first, second) => {
        const positionDifference =
            positionSortOrder(first.position) -
            positionSortOrder(second.position);

        if (positionDifference !== 0) {
            return positionDifference;
        }

        const firstNumber = first.number ?? 999;
        const secondNumber = second.number ?? 999;

        if (firstNumber !== secondNumber) {
            return firstNumber - secondNumber;
        }

        return first.name.localeCompare(second.name);
    });
}

function positionSortOrder(position: string | null): number {
    return (
        {
            G: 10,
            D: 20,
            M: 30,
            F: 40,
        }[position ?? ''] ?? 50
    );
}
