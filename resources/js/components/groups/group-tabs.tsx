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
        <div className="overflow-x-auto rounded-[1.75rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.92))] p-2.5 shadow-xl shadow-cyan-950/8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                role="tablist"
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
                            role="tab"
                            aria-selected={isActive}
                            className={[
                                'h-11 rounded-2xl border px-3 text-sm font-black shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'border-cyan-300 bg-[linear-gradient(180deg,rgba(236,254,255,1),rgba(207,250,254,0.9))] text-cyan-800 shadow-cyan-950/10'
                                    : 'border-white/90 bg-white/80 text-slate-600 shadow-cyan-950/5 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-900',
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
