import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    logo: string;
    name: string;
    code: string;
    isWinner: boolean;
    align?: 'left' | 'right';
}

export default function MatchTeam({
    id,
    logo,
    name,
    code,
    isWinner,
    align = 'left',
}: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className={cn(
                'group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all hover:border-cyan-100 hover:bg-cyan-50/40 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4',
                align === 'right' && 'justify-end text-right',
                isWinner &&
                    'border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.92),rgba(255,255,255,0.96))] ring-1 ring-emerald-100/80',
            )}
        >
            {align === 'left' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-11 shrink-0 object-contain drop-shadow-sm sm:size-14"
                />
            ) : null}

            <div className="min-w-0">
                <p
                    className="truncate text-base font-black text-slate-950 transition-colors group-hover:text-cyan-700 sm:text-lg"
                    title={name}
                >
                    {name}
                </p>
                <span
                    className={cn(
                        'mt-1.5 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black tracking-[0.12em] uppercase',
                        isWinner
                            ? 'border-emerald-200 bg-white text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                >
                    {code}
                </span>
                <span className="mt-2 hidden items-center gap-1 text-[10px] font-black tracking-[0.12em] text-slate-400 uppercase transition-colors group-hover:text-cyan-700 lg:inline-flex">
                    View team
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>

            {align === 'right' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-11 shrink-0 object-contain drop-shadow-sm sm:size-14"
                />
            ) : null}
        </Link>
    );
}
