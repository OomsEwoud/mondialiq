import MatchMissingPlayerRow from '@/components/matches/details/match-missing-player-row';
import type {
    MatchDetailsMissingPlayer,
    MatchDetailsTeam,
} from '@/types/match-details';

interface Props {
    team: MatchDetailsTeam;
    players: MatchDetailsMissingPlayer[];
}

export default function MatchMissingPlayersCard({ team, players }: Props) {
    return (
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="size-9 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                            {team.name}
                        </h3>
                        <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                            {formatUnavailableCount(players.length)}
                        </p>
                    </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-cyan-600 shadow-sm">
                    {players.length}
                </span>
            </div>

            {players.length > 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                    {players.map((player) => (
                        <MatchMissingPlayerRow
                            key={player.id}
                            player={player}
                        />
                    ))}
                </div>
            ) : (
                <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-500">
                    No missing players reported.
                </p>
            )}
        </section>
    );
}

function formatUnavailableCount(count: number): string {
    if (count === 0) {
        return 'No missing players reported';
    }

    return count === 1 ? '1 unavailable' : `${count} unavailable`;
}
