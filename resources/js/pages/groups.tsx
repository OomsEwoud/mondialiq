import { Head } from '@inertiajs/react';
import { useState } from 'react';
import GroupPageHeader from '@/components/groups/group-page-header';
import GroupPanel from '@/components/groups/group-panel';
import GroupTabs from '@/components/groups/group-tabs';
import GroupsEmptyState from '@/components/groups/groups-empty-state';
import type { WorldCupGroup } from '@/types/group';

interface Props {
    groups: WorldCupGroup[];
}

export default function Groups({ groups }: Props) {
    const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? '');
    const activeGroup =
        groups.find((group) => group.id === activeGroupId) ?? groups[0];

    return (
        <>
            <Head title="Group Standings" />

            <GroupPageHeader />

            {activeGroup ? (
                <div>
                    <GroupTabs
                        groups={groups}
                        activeGroupId={activeGroup.id}
                        onChange={setActiveGroupId}
                    />
                    <GroupPanel group={activeGroup} />
                </div>
            ) : (
                <GroupsEmptyState />
            )}
        </>
    );
}
