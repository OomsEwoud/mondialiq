import type { WorldCupGroup } from '@/types/group';

interface Props {
    groups: WorldCupGroup[];
    activeGroupId: string;
    onChange: (groupId: string) => void;
}

export default function GroupTabs({ groups, activeGroupId, onChange }: Props) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm shadow-blue-950/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                role="tablist"
                aria-label="World Cup groups"
                className="grid min-w-max auto-cols-[4.25rem] grid-flow-col gap-2 md:min-w-0 md:grid-flow-row md:grid-cols-8 lg:grid-cols-12"
            >
                {groups.map((group) => {
                    const isActive = group.id === activeGroupId;

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => onChange(group.id)}
                            role="tab"
                            aria-selected={isActive}
                            className={[
                                'h-11 rounded-xl border px-3 text-sm font-black transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            ].join(' ')}
                        >
                            {group.id}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
