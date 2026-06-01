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
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm shadow-blue-950/5 backdrop-blur">
            <div className="grid grid-cols-2 gap-1">
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
                                'flex min-h-12 items-center justify-center rounded-xl px-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'bg-blue-950 text-white shadow-sm ring-1 shadow-blue-950/15 ring-cyan-300/30'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                            )}
                        >
                            <span className="grid">
                                <span className="text-sm font-black">
                                    {tab.label}
                                </span>
                                <span
                                    className={cn(
                                        'hidden text-xs font-medium sm:block',
                                        isActive
                                            ? 'text-cyan-100'
                                            : 'text-slate-400',
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
