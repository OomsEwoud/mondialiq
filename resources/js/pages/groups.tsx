import { useState } from 'react';
import GroupPageHeader from '@/components/groups/group-page-header';
import GroupPanel from '@/components/groups/group-panel';
import GroupTabs, { THIRD_PLACE_TAB_ID } from '@/components/groups/group-tabs';
import GroupsEmptyState from '@/components/groups/groups-empty-state';
import ThirdPlacePanel from '@/components/groups/third-place-panel';
import PageHead from '@/components/seo/page-head';
import type { ThirdPlaceRanking, WorldCupGroup } from '@/types/group';

interface Props {
    groups: WorldCupGroup[];
    thirdPlaceRanking: ThirdPlaceRanking;
}

export default function Groups({ groups, thirdPlaceRanking }: Props) {
    const firstGroup = groups[0] ?? null;
    const hasThirdPlaceRanking = thirdPlaceRanking.teams.length > 0;
    const initialGroupId = firstGroup?.id ?? THIRD_PLACE_TAB_ID;
    const [activeGroupId, setActiveGroupId] = useState(initialGroupId);
    const activeGroup =
        groups.find((group) => group.id === activeGroupId) ?? firstGroup;
    const showThirdPlaceRanking =
        activeGroupId === THIRD_PLACE_TAB_ID && hasThirdPlaceRanking;
    const hasStandings = activeGroup !== null || hasThirdPlaceRanking;

    return (
        <>
            <PageHead
                title="Group Standings"
                description="Track World Cup 2026 group standings, qualification positions and third-place rankings with a clear tournament overview."
            />

            <GroupPageHeader />

            {hasStandings ? (
                <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
                    <GroupTabs
                        groups={groups}
                        activeGroupId={
                            showThirdPlaceRanking
                                ? THIRD_PLACE_TAB_ID
                                : (activeGroup?.id ?? THIRD_PLACE_TAB_ID)
                        }
                        showThirdPlaceRanking={hasThirdPlaceRanking}
                        onChange={setActiveGroupId}
                    />
                    {showThirdPlaceRanking || activeGroup === null ? (
                        <ThirdPlacePanel ranking={thirdPlaceRanking} />
                    ) : (
                        <GroupPanel group={activeGroup} />
                    )}
                </div>
            ) : (
                <GroupsEmptyState />
            )}
        </>
    );
}
