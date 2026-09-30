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
        ? 'Geen spelers gevonden voor deze zoekopdracht.'
        : 'Er zijn nog geen actieve spelers beschikbaar.';
    const showGroupHeaders = activeFilter === 'all';

    return (
        <section className="border-t border-[#29312c] pt-8 sm:pt-10">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-bold text-[#70b98e] uppercase">
                        WK-selectie
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                        <h2 className="text-3xl font-black text-[#f3f4f1] sm:text-4xl">
                            Actieve spelers
                        </h2>
                        <span className="rounded-sm border border-[#4b775d] bg-[#17251d] px-2.5 py-1 text-xs font-bold text-[#8fd0a8]">
                            {players.length}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-[#89928c]">
                        Zoek op naam of filter de selectie per positie.
                    </p>
                </div>

                <div className="w-full lg:max-w-md">
                    <SquadSearch value={query} onChange={setQuery} />
                </div>
            </div>

            {hasPlayers ? (
                <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-6">
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
                            <div className="flex flex-col gap-8">
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
