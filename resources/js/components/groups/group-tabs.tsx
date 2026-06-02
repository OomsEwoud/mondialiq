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
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-blue-950/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                role="tablist"
                aria-label="World Cup groups"
                className="grid min-w-max auto-cols-[5.25rem] grid-flow-col gap-2 md:min-w-0 md:grid-flow-row md:grid-cols-8 lg:grid-cols-[repeat(13,minmax(0,1fr))]"
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeGroupId;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            role="tab"
                            aria-selected={isActive}
                            className={[
                                'h-11 rounded-xl border px-3 text-sm font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
