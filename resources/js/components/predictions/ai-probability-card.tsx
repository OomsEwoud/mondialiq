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
                'rounded-xl border bg-slate-50 p-3 sm:p-4',
                isHighest
                    ? 'border-cyan-200 bg-cyan-50/40'
                    : 'border-slate-200',
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-bold text-blue-950">
                        {label}
                    </p>
                    {isHighest ? (
                        <span className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-[10px] font-black tracking-[0.12em] text-cyan-700 uppercase">
                            Highest
                        </span>
                    ) : null}
                </div>
                <p className="shrink-0 text-sm font-black text-blue-950">
                    {percentage}
                </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div
                    className={cn(
                        'h-2 rounded-full',
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
