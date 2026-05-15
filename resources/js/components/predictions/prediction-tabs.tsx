import { Bot, UserRound } from 'lucide-react';

export type PredictionTab = 'ai' | 'mine';

interface Props {
    activeTab: PredictionTab;
    onChange: (tab: PredictionTab) => void;
}

const tabs = [
    {
        value: 'ai',
        label: 'AI Predictions',
        icon: Bot,
    },
    {
        value: 'mine',
        label: 'My Predictions',
        icon: UserRound,
    },
] satisfies {
    value: PredictionTab;
    label: string;
    icon: typeof Bot;
}[];

export default function PredictionTabs({ activeTab, onChange }: Props) {
    return (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <div className="grid grid-cols-2 gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onChange(tab.value)}
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none ${
                                isActive
                                    ? 'bg-blue-950 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-950'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
