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
        <div className="mb-5 rounded-[1.6rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.9))] p-1.5 shadow-lg shadow-cyan-950/6 backdrop-blur">
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
                                'flex min-h-13 items-center justify-center rounded-2xl px-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                                isActive
                                    ? 'bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] text-white shadow-lg shadow-blue-950/20 ring-1 ring-cyan-300/25'
                                    : 'text-slate-600 hover:bg-white hover:text-slate-950',
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
