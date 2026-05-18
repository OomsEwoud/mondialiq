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
            className="flex items-center gap-2 rounded-lg transition-colors hover:bg-blue-50"
        >
            {!reverse && (
                <img
                    src={logo}
                    alt={name}
                    className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
            )}
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
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
