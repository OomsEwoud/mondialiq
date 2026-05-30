import { cn } from '@/lib/utils';
import { formatProbability } from '@/utils/ai-prediction';

interface Props {
    label: string;
    value: number | null;
    tone: 'home' | 'draw' | 'away';
}

export default function AiProbabilityCard({ label, value, tone }: Props) {
    const percentage = formatProbability(value);
    const width = value === null ? 0 : Math.max(0, Math.min(100, value));

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-blue-950">{label}</p>
                <p className="text-sm font-black text-blue-950">{percentage}</p>
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
