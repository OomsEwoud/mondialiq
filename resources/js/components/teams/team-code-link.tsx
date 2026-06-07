import { Link } from '@inertiajs/react';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    code: string;
    logo: string;
    name: string;
    reverse?: boolean;
}

export default function TeamCodeLink({
    id,
    code,
    logo,
    name,
    reverse = false,
}: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            {!reverse && (
                <img
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                {code}
            </span>
            {reverse && (
                <img
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
        </Link>
    );
}
