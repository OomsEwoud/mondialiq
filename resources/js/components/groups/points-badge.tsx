import { cn } from '@/lib/utils';

interface Props {
    points: number;
}

export default function PointsBadge({ points }: Props) {
    return (
        <span
            className={cn(
                'inline-flex min-w-11 items-center justify-center rounded-full border px-3 py-1 text-sm font-black shadow-sm',
                points > 0
                    ? 'border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(209,250,229,0.85))] text-emerald-800 shadow-emerald-950/5'
                    : 'border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] text-slate-700 shadow-cyan-950/5',
            )}
        >
            {points}
        </span>
    );
}
