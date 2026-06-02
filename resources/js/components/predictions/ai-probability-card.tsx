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
                'rounded-[1.35rem] border p-4 shadow-sm shadow-cyan-950/5',
                isHighest
                    ? 'border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.86),rgba(255,255,255,0.98))]'
                    : 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(255,255,255,0.96))]',
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-black text-blue-950">
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
