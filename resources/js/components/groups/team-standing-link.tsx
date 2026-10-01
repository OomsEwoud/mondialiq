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
            className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 transition-all hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <TeamCodeBadge code={code} logo={logo} />
            <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary sm:text-base">
                {name}
            </span>
        </Link>
    );
}
