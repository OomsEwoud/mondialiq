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
                'rounded-xl border p-4 shadow-sm',
                isHighest
                    ? 'border-border bg-gradient-to-b from-accent/40 to-card'
                    : 'border-border bg-card',
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-bold text-foreground">
                        {label}
                    </p>
                    {isHighest && (
                        <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                            Likely
                        </span>
                    )}
                </div>
                <p className="shrink-0 text-sm font-bold text-foreground">
                    {percentage}
                </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
                <div
                    className={cn(
                        'h-2 rounded-full transition-all',
                        tone === 'home' && 'bg-muted',
                        tone === 'draw' && 'bg-slate-500',
                        tone === 'away' && 'bg-slate-400',
                    )}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}
