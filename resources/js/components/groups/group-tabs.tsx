import type { CompetitionGroup } from '@/types/group';

interface Props {
    groups: CompetitionGroup[];
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
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
                role="group"
                aria-label="Competitiegroepen"
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
                                'h-11 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'border-primary/30 bg-brand-subtle text-foreground'
                                    : 'border-transparent bg-surface-elevated text-muted-foreground hover:bg-surface-interactive hover:text-foreground',
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
