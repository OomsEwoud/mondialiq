import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import PlayerCard from '@/components/teams/player-card';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';
import type { TeamDetailsPlayer } from '@/types/team-details';
import type { PlayerPositionGroupKey } from '@/utils/team-players';
import {
    filterPlayersByQuery,
    getPlayerPositionGroup,
    groupPlayersByPosition,
    sortPlayersByPositionAndNumber,
} from '@/utils/team-players';

interface Props {
    players: TeamDetailsPlayer[];
}

interface PositionFilter {
    key: 'all' | PlayerPositionGroupKey;
    label: string;
}

const positionFilters: PositionFilter[] = [
    { key: 'all', label: 'All' },
    { key: 'goalkeepers', label: 'Goalkeepers' },
    { key: 'defenders', label: 'Defenders' },
    { key: 'midfielders', label: 'Midfielders' },
    { key: 'attackers', label: 'Attackers' },
];

export default function ActivePlayersGrid({ players }: Props) {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] =
        useState<PositionFilter['key']>('all');

    const sortedPlayers = useMemo(
        () => sortPlayersByPositionAndNumber(players),
        [players],
    );

    const visiblePlayers = useMemo(() => {
        const filteredPlayers =
            activeFilter === 'all'
                ? sortedPlayers
                : sortedPlayers.filter(
                      (player) =>
                          getPlayerPositionGroup(player.position) ===
                          activeFilter,
                  );

        return filterPlayersByQuery(filteredPlayers, query);
    }, [activeFilter, query, sortedPlayers]);

    const groupedPlayers = useMemo(
        () => groupPlayersByPosition(visiblePlayers),
        [visiblePlayers],
    );

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">
                        Squad
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                        <h2 className="text-lg font-black text-blue-950">
                            Active players
                        </h2>
                        <span className="rounded-md bg-cyan-100 px-3 py-1 text-xs font-black text-blue-950">
                            {players.length}
                        </span>
                    </div>
                </div>

                <div className="relative w-full lg:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search players"
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 pr-3 pl-9 text-sm font-semibold shadow-none focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                    />
                </div>
            </div>

            {players.length > 0 ? (
                <>
                    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                        {positionFilters.map((filter) => (
                            <Button
                                key={filter.key}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveFilter(filter.key)}
                                className={cn(
                                    'shrink-0 rounded-full border-slate-200 bg-white px-3 text-xs font-black text-slate-500 shadow-none hover:border-cyan-200 hover:bg-cyan-50 hover:text-blue-950',
                                    activeFilter === filter.key &&
                                        'border-cyan-300 bg-cyan-100 text-blue-950',
                                )}
                            >
                                {filter.label}
                            </Button>
                        ))}
                    </div>

                    {groupedPlayers.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {groupedPlayers.map((group) => (
                                <div key={group.key}>
                                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                                        <h3 className="text-sm font-black tracking-wide text-blue-950 uppercase">
                                            {group.label}
                                        </h3>
                                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
                                            {group.players.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {group.players.map((player) => (
                                            <PlayerCard
                                                key={player.id}
                                                player={player}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                            No players match your search.
                        </p>
                    )}
                </>
            ) : (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                    No active players available yet.
                </p>
            )}
        </section>
    );
}
