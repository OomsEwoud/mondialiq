import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { predictions } from '@/routes';

export type PredictionTab = 'ai' | 'mine';

interface Props {
    activeTab: PredictionTab;
}

const tabs = [
    {
        value: 'ai',
        label: 'AI Predictions',
        sublabel: 'Model insights',
    },
    {
        value: 'mine',
        label: 'My Predictions',
        sublabel: 'Your picks',
    },
] satisfies {
    value: PredictionTab;
    label: string;
    sublabel: string;
}[];

export default function PredictionTabs({ activeTab }: Props) {
    return (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-1.5 shadow-sm">
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
                                'flex min-h-13 items-center justify-center rounded-xl px-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm',
                            )}
                        >
                            <span className="grid">
                                <span className="text-sm font-bold">
                                    {tab.label}
                                </span>
                                <span
                                    className={cn(
                                        'hidden text-xs font-medium sm:block',
                                        isActive && tab.value === 'ai' &&
                                            'text-cyan-300',
                                        isActive && tab.value === 'mine' &&
                                            'text-cyan-300',
                                        !isActive && 'text-slate-400',
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
