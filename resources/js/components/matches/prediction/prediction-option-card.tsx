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
            className={cn(
                'flex min-h-24 w-full flex-col justify-between rounded-lg border bg-white p-3 text-left transition-all',
                'hover:border-blue-300 hover:bg-blue-50/50 focus:ring-2 focus:ring-blue-100 focus:outline-none',
                selected
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-slate-200',
                disabled && 'cursor-not-allowed opacity-60 hover:bg-white',
            )}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">
                    {label}
                </span>
                {selected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
            </span>
            <span className="text-xs text-slate-500">{description}</span>
        </button>
    );
}
