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
                'relative flex min-h-24 w-full flex-col justify-between rounded-2xl border bg-card p-3 text-left transition-all sm:p-4',
                'hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                selected
                    ? 'border-ring bg-accent text-foreground shadow-sm ring-2 ring-border'
                    : 'border-border text-foreground',
                disabled &&
                    'cursor-not-allowed opacity-60 hover:border-border hover:bg-card',
            )}
        >
            <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">
                    {label}
                </span>
                {selected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1 text-xs font-bold text-primary ring-1 ring-border">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                    </span>
                )}
            </span>
            <span className="text-xs leading-5 text-muted-foreground">
                {description}
            </span>
        </button>
    );
}
