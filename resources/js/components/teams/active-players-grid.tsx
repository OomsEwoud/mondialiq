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
        <section className="rounded-[1.9rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:p-6">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-700 uppercase">
                        Squad
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                        <h2 className="text-2xl font-black text-blue-950">
                            Active players
                        </h2>
                        <span className="rounded-full border border-cyan-100 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.88))] px-3 py-1 text-xs font-black text-cyan-700 shadow-sm shadow-cyan-950/5">
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
