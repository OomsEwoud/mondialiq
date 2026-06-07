import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    logo: string;
    name: string;
    code: string;
    align?: 'left' | 'right';
}

export default function MatchDetailsTeamBlock({
    id,
    logo,
    name,
    code,
    align = 'left',
}: Props) {
    const isRightAligned = align === 'right';

    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className={cn(
                'flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-all hover:bg-cyan-50/60 hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-4 sm:px-4',
                isRightAligned && 'flex-row-reverse text-right',
            )}
        >
            <img
                src={logo}
                alt={name}
                className="h-11 w-11 shrink-0 object-contain drop-shadow-sm sm:h-14 sm:w-14"
            />
            <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900 sm:text-2xl">
                    {name}
                </p>
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    {code}
                </p>
            </div>
        </Link>
    );
}
