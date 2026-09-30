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
            aria-label={`Bekijk details van ${name}`}
            className={`group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[#171c19] focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none ${isRightAligned ? 'sm:flex-row-reverse sm:text-right' : ''}`}
        >
            <img
                src={logo}
                alt={name}
                className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
                <p className="text-xs font-medium text-[#68716b]">{label}</p>
                <p className="font-bold text-[#daddd9] transition-colors group-hover:text-white">
                    {name}
                </p>
                <span className="mt-0.5 hidden items-center gap-1 text-xs font-bold text-[#68716b] transition-colors group-hover:text-[#8fd0a8] sm:inline-flex">
                    Bekijk ploeg
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>
        </Link>
    );
}
