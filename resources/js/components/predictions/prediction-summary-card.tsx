import type { LucideIcon } from 'lucide-react';
import { predictionAccent } from '@/components/predictions/prediction-variants';
import type { PredictionVariant } from '@/components/predictions/prediction-variants';
import { cn } from '@/lib/utils';

interface Props {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
    variant?: PredictionVariant;
}

export default function PredictionSummaryCard({
    icon: Icon,
    label,
    value,
    helper,
    variant = 'ai',
}: Props) {
    const accent = predictionAccent[variant];

    return (
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl',
                        accent.iconWrap,
                    )}
                >
                    <Icon className="size-5" />
                </span>
                <p
                    className={cn(
                        'text-xs font-semibold tracking-wide uppercase',
                        accent.text,
                    )}
                >
                    {label}
                </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
            {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
        </article>
    );
}
