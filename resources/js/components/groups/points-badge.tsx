import { cn } from '@/lib/utils';

interface Props {
    points: number;
}

export default function PointsBadge({ points }: Props) {
    return (
        <span
            className={cn(
                'inline-flex min-w-11 items-center justify-center rounded-full border px-3 py-1 text-sm font-black',
                points > 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-700',
            )}
        >
            {points}
        </span>
    );
}
