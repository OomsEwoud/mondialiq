import { Link } from '@inertiajs/react';
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
            className={`flex items-center gap-3 rounded-lg transition-colors hover:bg-blue-50 ${isRightAligned ? 'sm:flex-row-reverse sm:text-right' : ''}`}
        >
            <img
                src={logo}
                alt={name}
                className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="font-bold text-slate-800">{name}</p>
            </div>
        </Link>
    );
}
