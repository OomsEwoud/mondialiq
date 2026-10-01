import { Link } from '@inertiajs/react';
import TeamCrest from '@/components/ui/display/team-crest';
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
            <TeamCrest
                src={logo}
                name={name}
                className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">{code}</p>
                <p className="text-sm font-semibold break-words text-muted-foreground">
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
                'hover:bg-card hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
        >
            {content}
        </Link>
    );
}
