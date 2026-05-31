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
                'group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:bg-slate-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                align === 'right' && 'justify-end text-right',
                isWinner && 'bg-emerald-50/60 ring-1 ring-emerald-100',
            )}
        >
            {align === 'left' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-10 shrink-0 object-contain sm:size-12"
                />
            ) : null}

            <div className="min-w-0">
                <p
                    className="truncate text-sm font-black text-slate-950 transition-colors group-hover:text-cyan-700 sm:text-base"
                    title={name}
                >
                    {name}
                </p>
                <span
                    className={cn(
                        'mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-black',
                        isWinner
                            ? 'border-emerald-200 bg-white text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                >
                    {code}
                </span>
                <span className="mt-1 hidden items-center gap-1 text-[10px] font-bold text-slate-400 transition-colors group-hover:text-cyan-700 lg:inline-flex">
                    View team
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>

            {align === 'right' ? (
                <img
                    src={logo}
                    alt={name}
                    className="size-10 shrink-0 object-contain sm:size-12"
                />
            ) : null}
        </Link>
    );
}
