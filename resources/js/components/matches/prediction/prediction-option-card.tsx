import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    label: string;
    description: string;
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

export default function PredictionOptionCard({
    label,
    description,
    selected,
    disabled = false,
    onSelect,
}: Props) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onSelect}
            aria-pressed={selected}
            className={cn(
                'relative flex min-h-24 w-full flex-col justify-between rounded-2xl border bg-white p-3 text-left transition-all sm:p-4',
                'hover:border-cyan-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                selected
                    ? 'border-cyan-300 bg-cyan-50 text-slate-900 shadow-sm ring-2 ring-slate-200'
                    : 'border-slate-200 text-slate-700',
                disabled &&
                    'cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-white',
            )}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">
                    {label}
                </span>
                {selected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-cyan-700 ring-1 ring-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                    </span>
                )}
            </span>
            <span className="text-xs leading-5 text-slate-500">
                {description}
            </span>
        </button>
    );
}
