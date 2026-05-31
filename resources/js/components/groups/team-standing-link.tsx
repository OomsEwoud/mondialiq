import { Link } from '@inertiajs/react';

import TeamCodeBadge from '@/components/groups/team-code-badge';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    code: string;
    logo: string | null;
    name: string;
}

export default function TeamStandingLink({ id, code, logo, name }: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`View ${name} team details`}
            className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <TeamCodeBadge code={code} logo={logo} />
            <span className="truncate font-black text-slate-900 transition-colors group-hover:text-cyan-700">
                {name}
            </span>
        </Link>
    );
}
