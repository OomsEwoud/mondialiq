import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import TeamCrest from '@/components/ui/display/team-crest';
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
            className={`group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${isRightAligned ? 'sm:flex-row-reverse sm:text-right' : ''}`}
        >
            <TeamCrest
                src={logo}
                name={name}
                className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
                <p className="text-xs font-medium text-text-muted">{label}</p>
                <p className="font-bold text-foreground transition-colors group-hover:text-foreground">
                    {name}
                </p>
                <span className="mt-0.5 hidden items-center gap-1 text-xs font-bold text-text-muted transition-colors group-hover:text-positive sm:inline-flex">
                    Bekijk ploeg
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>
        </Link>
    );
}
