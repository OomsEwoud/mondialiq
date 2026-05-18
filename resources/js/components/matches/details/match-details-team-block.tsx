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
            className={cn(
                'flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-50',
                isRightAligned && 'flex-row-reverse text-right',
            )}
        >
            <img src={logo} alt={name} className="h-12 w-12 object-contain" />
            <div className="min-w-0">
                <p className="truncate text-lg font-black text-blue-950">
                    {name}
                </p>
                <p className="text-xs font-bold text-slate-400">{code}</p>
            </div>
        </Link>
    );
}
