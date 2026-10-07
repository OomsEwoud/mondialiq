import { Link } from '@inertiajs/react';
import TeamCrest from '@/components/ui/display/team-crest';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    logo: string;
    name: string;
    code: string;
    align?: 'left' | 'right';
}

export default function MatchDetailsTeamBlock({ id, logo, name, code }: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`Bekijk ${name}`}
            className={cn(
                'group flex min-w-0 flex-col items-center gap-3 rounded-md px-1 py-2 text-center transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:gap-4 sm:px-4',
            )}
        >
            <TeamCrest
                src={logo}
                name={name}
                className="size-12 shrink-0 object-contain sm:size-16"
            />
            <div className="min-w-0">
                <p className="text-sm font-semibold break-words text-foreground sm:text-xl">
                    {name}
                </p>
                <p className="mt-1 text-xs tracking-widest text-muted-foreground uppercase">
                    {code}
                </p>
            </div>
        </Link>
    );
}
