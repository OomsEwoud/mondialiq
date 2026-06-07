import { cn } from '@/lib/utils';
import { formatProbability } from '@/utils/ai-prediction';

interface Props {
    label: string;
    value: number | null;
    tone: 'home' | 'draw' | 'away';
    isHighest: boolean;
}

export default function AiProbabilityCard({
    label,
    value,
    tone,
    isHighest,
}: Props) {
    const percentage = formatProbability(value);
    const width = value === null ? 0 : Math.max(0, Math.min(100, value));

    return (
        <div
            className={cn(
                'rounded-2xl border p-4 shadow-sm',
                isHighest
                    ? 'border-cyan-200 bg-gradient-to-b from-cyan-50/60 to-white'
                    : 'border-slate-200 bg-gradient-to-b from-white to-slate-50/60',
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                        {label}
                    </p>
                    {isHighest ? (
                        <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-xs font-bold tracking-wide text-cyan-600 uppercase">
                            Highest
                        </span>
                    ) : null}
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-900">
                    {percentage}
                </p>
            </div>
            <div className="mt-4 h-2.5 rounded-full bg-slate-200">
                <div
                    className={cn(
                        'h-2.5 rounded-full shadow-sm',
                        tone === 'home' && 'bg-blue-950',
                        tone === 'draw' && 'bg-cyan-500',
                        tone === 'away' && 'bg-slate-500',
                    )}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}
