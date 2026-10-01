import type { WorldCupGroup } from '@/types/group';

interface Props {
    groups: WorldCupGroup[];
    activeGroupId: string;
    showThirdPlaceRanking: boolean;
    onChange: (groupId: string) => void;
}

export const THIRD_PLACE_TAB_ID = 'BEST_3RD';

export default function GroupTabs({
    groups,
    activeGroupId,
    showThirdPlaceRanking,
    onChange,
}: Props) {
    const tabs = [
        ...groups.map((group) => ({
            id: group.id,
            label: group.id,
        })),
        ...(showThirdPlaceRanking
            ? [{ id: THIRD_PLACE_TAB_ID, label: 'Best 3rd' }]
            : []),
    ];

    return (
        <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-2.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                role="group"
                aria-label="World Cup groups"
                className="grid min-w-max auto-cols-[5.25rem] grid-flow-col gap-2.5 md:min-w-0 md:grid-flow-row md:grid-cols-8 lg:grid-cols-[repeat(13,minmax(0,1fr))]"
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeGroupId;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            aria-pressed={isActive}
                            className={[
                                'h-11 rounded-2xl border px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'border-slate-900 bg-secondary text-white shadow-md'
                                    : 'border-transparent bg-card text-muted-foreground hover:border-border hover:bg-accent',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
