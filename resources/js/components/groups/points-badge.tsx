import { cn } from '@/lib/utils';

interface Props {
    points: number;
}

export default function PointsBadge({ points }: Props) {
    return (
        <span
            className={cn(
                'inline-flex min-w-[3.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-sm font-bold shadow-sm',
                points > 0
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600',
            )}
        >
            {points} <span className="ml-1 text-[11px] font-semibold uppercase opacity-75">pts</span>
        </span>
    );
}
