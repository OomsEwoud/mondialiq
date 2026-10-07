import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import TeamCrest from '@/components/ui/display/team-crest';
import { cn } from '@/lib/utils';
import { show as showTeam } from '@/routes/teams';

interface Props {
    id: number;
    logo: string;
    name: string;
    code: string;
    isWinner: boolean;
    align?: 'left' | 'right';
}

export default function MatchTeam({
    id,
    logo,
    name,
    code,
    isWinner,
    align = 'left',
}: Props) {
    return (
        <Link
            href={showTeam.url(id)}
            aria-label={`Bekijk details van ${name}`}
            className={cn(
                'group flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-md px-1 py-2 transition-colors hover:bg-surface-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:gap-4 sm:px-3',
                align === 'right' &&
                    'flex-col-reverse sm:flex-row sm:justify-end sm:text-right',
                isWinner && 'bg-brand-subtle',
            )}
        >
            {align === 'left' ? (
                <TeamCrest
                    src={logo}
                    name={name}
                    className="size-10 shrink-0 object-contain sm:size-14"
                />
            ) : null}

            <div className="min-w-0">
                <p
                    className="text-sm font-bold break-words text-foreground sm:text-lg"
                    title={name}
                >
                    {name}
                </p>
                <span
                    className={cn(
                        'mt-1 inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase sm:text-xs',
                        isWinner
                            ? 'border-border-strong bg-brand-subtle text-positive'
                            : 'border-border-strong bg-surface-interactive text-muted-foreground',
                    )}
                >
                    {code}
                </span>
                <span className="mt-2 hidden items-center gap-1 text-xs text-text-muted transition-colors group-hover:text-positive lg:inline-flex">
                    Bekijk ploeg
                    <ArrowUpRight className="h-3 w-3" />
                </span>
            </div>

            {align === 'right' ? (
                <TeamCrest
                    src={logo}
                    name={name}
                    className="size-10 shrink-0 object-contain sm:size-14"
                />
            ) : null}
        </Link>
    );
}
