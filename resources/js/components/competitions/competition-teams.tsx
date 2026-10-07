import { Link } from '@inertiajs/react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as teamShow } from '@/routes/teams';
import type { CompetitionTeam } from '@/types/competition';

export default function CompetitionTeams({
    teams,
}: {
    teams: CompetitionTeam[];
}) {
    if (teams.length === 0) {
        return (
            <p className="py-5 text-sm text-text-muted">
                Er zijn nog geen teams beschikbaar.
            </p>
        );
    }

    return (
        <ul className="grid gap-x-8 sm:grid-cols-2">
            {teams.map((team) => (
                <li key={team.id} className="border-b border-border-subtle">
                    <Link
                        href={teamShow.url(team.id)}
                        className="flex min-h-16 items-center gap-3 py-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <ImageWithFallback
                            src={team.logoUrl ?? undefined}
                            alt=""
                            className="size-8 shrink-0 object-contain"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                            {team.name}
                        </span>
                        <span className="text-xs text-text-muted">
                            {team.code ?? ''}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
