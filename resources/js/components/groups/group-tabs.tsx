import type { WorldCupGroup } from '@/types/group';

interface Props {
    groups: WorldCupGroup[];
    activeGroupId: string;
    onChange: (groupId: string) => void;
}

export default function GroupTabs({ groups, activeGroupId, onChange }: Props) {
    return (
        <div className="overflow-x-auto rounded-t-lg border border-slate-200 bg-slate-50">
            <div className="grid min-w-max auto-cols-[4.5rem] grid-flow-col md:min-w-0 md:grid-flow-row md:grid-cols-8">
                {groups.map((group) => {
                    const isActive = group.id === activeGroupId;

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => onChange(group.id)}
                            className={[
                                'h-12 border-r border-slate-200 text-sm font-black transition-colors last:border-r-0 sm:h-14',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-white hover:text-blue-700',
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
