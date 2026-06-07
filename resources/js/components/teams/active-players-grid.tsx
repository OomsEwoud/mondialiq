import { useMemo, useState } from 'react';
import PlayerPositionGroup from '@/components/teams/player-position-group';
import SquadEmptyState from '@/components/teams/squad-empty-state';
import SquadPositionFilters from '@/components/teams/squad-position-filters';
import SquadSearch from '@/components/teams/squad-search';
import type { SquadPositionFilter } from '@/const/team-squad';
import type { TeamDetailsPlayer } from '@/types/team-details';
import {
    filterPlayersByQuery,
    getPlayerPositionGroup,
    groupPlayersByPosition,
    sortPlayersByPositionAndNumber,
} from '@/utils/team-players';

interface Props {
    players: TeamDetailsPlayer[];
}

export default function ActivePlayersGrid({ players }: Props) {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] =
        useState<SquadPositionFilter['key']>('all');

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
    const hasPlayers = players.length > 0;
    const hasVisiblePlayers = groupedPlayers.length > 0;
    const emptyMessage = hasPlayers
        ? 'No players match your search.'
        : 'No active players available yet.';
    const showGroupHeaders = activeFilter === 'all';

    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xl shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                        Squad
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Active players
                        </h2>
                        <span className="rounded-full border border-slate-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-600 shadow-sm">
                            {players.length}
                        </span>
                    </div>
                </div>

                <div className="w-full lg:max-w-sm">
                    <SquadSearch value={query} onChange={setQuery} />
                </div>
            </div>

            {hasPlayers ? (
                <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6">
                    <SquadPositionFilters
                        activeFilter={activeFilter}
                        onChange={setActiveFilter}
                        variant="desktop"
                    />
                    <div className="min-w-0">
                        <div className="mb-4">
                            <SquadPositionFilters
                                activeFilter={activeFilter}
                                onChange={setActiveFilter}
                                variant="mobile"
                            />
                        </div>

                        {hasVisiblePlayers ? (
                            <div className="flex flex-col gap-6">
                                {groupedPlayers.map((group) => (
                                    <PlayerPositionGroup
                                        key={group.key}
                                        group={group}
                                        compactHeader={!showGroupHeaders}
                                    />
                                ))}
                            </div>
                        ) : (
                            <SquadEmptyState message={emptyMessage} />
                        )}
                    </div>
                </div>
            ) : (
                <SquadEmptyState message={emptyMessage} />
            )}
        </section>
    );
}
