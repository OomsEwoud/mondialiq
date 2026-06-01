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
                'flex min-w-0 cursor-pointer items-center gap-2 rounded-xl p-2 transition-colors hover:bg-slate-50 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-3',
                isRightAligned && 'flex-row-reverse text-right',
            )}
        >
            <img
                src={logo}
                alt={name}
                className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
            />
            <div className="min-w-0">
                <p className="truncate text-sm font-black text-blue-950 sm:text-lg">
                    {name}
                </p>
                <p className="text-xs font-black tracking-wide text-slate-400">
                    {code}
                </p>
            </div>
        </Link>
    );
}
