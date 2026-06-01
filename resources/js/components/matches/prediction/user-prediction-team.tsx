import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id?: number;
    logo: string;
    name: string;
    code: string;
    align?: 'left' | 'right';
}

export default function UserPredictionTeam({
    id,
    logo,
    name,
    code,
    align = 'left',
}: Props) {
    const content = (
        <>
            <img
                src={logo}
                alt={name}
                className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                    {code}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                    {name}
                </p>
            </div>
        </>
    );
    const className = cn(
        'flex min-w-0 items-center gap-2 rounded-xl p-2 transition-colors',
        align === 'right' && 'flex-row-reverse text-right',
    );

    if (!id) {
        return <div className={className}>{content}</div>;
    }

    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className={cn(
                className,
                'hover:bg-white hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
        >
            {content}
        </Link>
    );
}
