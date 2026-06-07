import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    label: string;
    logo: string;
    name: string;
    align?: 'left' | 'right';
}

export default function MatchDetailTeam({
    id,
    label,
    logo,
    name,
    align = 'left',
}: Props) {
    const isRightAligned = align === 'right';

    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className={`group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none ${isRightAligned ? 'sm:flex-row-reverse sm:text-right' : ''}`}
        >
            <img
                src={logo}
                alt={name}
                className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="font-bold text-slate-800 transition-colors group-hover:text-cyan-700">
                    {name}
                </p>
                <span className="mt-0.5 hidden items-center gap-1 text-xs font-bold text-slate-400 transition-colors group-hover:text-cyan-700 sm:inline-flex">
                    View team
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>
        </Link>
    );
}
