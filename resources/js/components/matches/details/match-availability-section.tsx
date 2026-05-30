import { CircleAlert, ShieldCheck } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type {
    MatchDetails,
    MatchDetailsMissingPlayer,
    MatchDetailsTeam,
} from '@/types/match-details';

interface Props {
    match: MatchDetails;
}

export default function MatchAvailabilitySection({ match }: Props) {
    const hasMissingPlayers =
        match.availability.home.length > 0 ||
        match.availability.away.length > 0;

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">
                        Squad availability
                    </p>
                    <h2 className="mt-1 text-lg font-black text-blue-950">
                        Missing players
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Players reported missing or questionable for this
                        fixture.
                    </p>
                </div>
                {hasMissingPlayers ? (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                        <CircleAlert className="size-3.5" />
                        Team news
                    </span>
                ) : (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        <ShieldCheck className="size-3.5" />
                        Clear report
                    </span>
                )}
            </div>

            {hasMissingPlayers ? (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <TeamMissingPlayersCard
                        team={match.homeTeam}
                        players={match.availability.home}
                    />
                    <TeamMissingPlayersCard
                        team={match.awayTeam}
                        players={match.availability.away}
                    />
                </div>
            ) : (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    No missing players reported for this fixture.
                </div>
            )}
        </section>
    );
}

function TeamMissingPlayersCard({
    team,
    players,
}: {
    team: MatchDetailsTeam;
    players: MatchDetailsMissingPlayer[];
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
                            {formatUnavailableCount(players.length)}
                        </p>
                    </div>
                </div>
                <span className="rounded-md border border-blue-100 bg-white px-2.5 py-1 text-xs font-black text-blue-700">
                    {players.length}
                </span>
            </div>

            {players.length > 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                    {players.map((player) => (
                        <MissingPlayerRow key={player.id} player={player} />
                    ))}
                </div>
            ) : (
                <p className="mt-3 rounded-md border border-dashed border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-500">
                    No missing players reported.
                </p>
            )}
        </section>
    );
}

function MissingPlayerRow({ player }: { player: MatchDetailsMissingPlayer }) {
    const getInitials = useInitials();
    const typeLabel = formatMissingPlayerType(player.type);
    const reason = formatMissingPlayerReason(player.reason);
    const meta = [formatPlayerMeta(player), reason].filter(Boolean).join(' · ');

    return (
        <div className="flex min-w-0 items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2.5 shadow-xs">
            <Avatar className="size-10 border border-white shadow-sm ring-1 ring-slate-200">
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

            <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="min-w-0 truncate text-sm font-black text-slate-800"
                        title={player.name}
                    >
                        {player.name}
                    </p>
                    <span
                        className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black',
                            typeLabel === 'Questionable'
                                ? 'bg-cyan-50 text-cyan-700'
                                : 'bg-amber-50 text-amber-700',
                        )}
                    >
                        {typeLabel}
                    </span>
                </div>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                    {meta || 'Reason not available'}
                </p>
            </div>
        </div>
    );
}

function formatUnavailableCount(count: number): string {
    if (count === 0) {
        return 'No missing players reported';
    }

    return count === 1 ? '1 unavailable' : `${count} unavailable`;
}

function formatMissingPlayerType(type: string | null): string {
    const normalizedType = type?.toLowerCase() ?? '';

    if (['questionable', 'doubtful'].includes(normalizedType)) {
        return 'Questionable';
    }

    return 'Missing';
}

function formatMissingPlayerReason(reason: string | null): string | null {
    const trimmedReason = reason?.trim();

    return trimmedReason === '' ? null : (trimmedReason ?? null);
}

function formatPlayerMeta(player: MatchDetailsMissingPlayer): string | null {
    const details = [
        player.number ? `#${player.number}` : null,
        player.position,
        player.country,
    ].filter(Boolean);

    return details.length > 0 ? details.join(' · ') : null;
}
