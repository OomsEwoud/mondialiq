import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { predictions } from '@/routes';

export type PredictionTab = 'ai' | 'mine' | 'user';

interface Props {
    activeTab: PredictionTab;
}

const tabs = [
    {
        value: 'ai',
        label: 'AI-analyse',
        sublabel: 'Kansen & context',
    },
    {
        value: 'mine',
        label: 'Mijn voorspellingen',
        sublabel: 'Jouw keuzes',
    },
] satisfies {
    value: PredictionTab;
    label: string;
    sublabel: string;
}[];

export default function PredictionTabs({ activeTab }: Props) {
    return (
        <div className="mb-5 rounded-2xl border border-border bg-gradient-to-b from-card to-card p-1.5 shadow-sm">
            <div className="grid grid-cols-2 gap-1.5">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;

                    return (
                        <Link
                            key={tab.value}
                            href={predictions.url({
                                query: { mode: tab.value },
                            })}
                            aria-current={isActive ? 'page' : undefined}
                            aria-selected={isActive}
                            className={cn(
                                'flex min-h-13 items-center justify-center rounded-xl px-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'bg-secondary text-white shadow-md'
                                    : 'text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm',
                            )}
                        >
                            <span className="grid">
                                <span className="text-sm font-bold">
                                    {tab.label}
                                </span>
                                <span
                                    className={cn(
                                        'hidden text-xs font-medium sm:block',
                                        isActive &&
                                            tab.value === 'ai' &&
                                            'text-primary',
                                        isActive &&
                                            tab.value === 'mine' &&
                                            'text-primary',
                                        !isActive && 'text-muted-foreground',
                                    )}
                                >
                                    {tab.sublabel}
                                </span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
