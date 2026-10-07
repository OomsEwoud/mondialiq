import { Link } from '@inertiajs/react';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import { show as showTeam } from '@/routes/teams';
import type { Match } from '@/types/match';

export default function AiPredictionHero({ match }: { match: Match }) {
    const teams = [
        {
            id: match.homeTeamId,
            name: match.homeTeam,
            logo: match.homeTeamLogo,
        },
        {
            id: match.awayTeamId,
            name: match.awayTeam,
            logo: match.awayTeamLogo,
        },
    ];

    return (
        <header className="pb-2 text-center">
            <h1 className="sr-only">
                AI-analyse: {match.homeTeam} tegen {match.awayTeam}
            </h1>
            <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 sm:gap-10">
                {teams.map((team, index) => (
                    <Link
                        key={team.id}
                        href={showTeam(team.id)}
                        className="group flex min-w-0 flex-col items-center gap-3 rounded-lg py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        style={{ gridColumn: index === 0 ? 1 : 3, gridRow: 1 }}
                    >
                        <ImageWithFallback
                            src={team.logo}
                            alt=""
                            className="size-12 object-contain sm:size-14"
                        />
                        <span className="text-base font-semibold break-words text-foreground transition-colors group-hover:text-primary sm:text-xl">
                            {team.name}
                        </span>
                    </Link>
                ))}
                <span className="col-start-2 row-start-1 text-sm text-muted-foreground">
                    vs
                </span>
            </div>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {[match.leagueName, match.round, match.date, match.time]
                    .filter(Boolean)
                    .map((value, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-2"
                        >
                            {index > 0 && (
                                <span
                                    aria-hidden="true"
                                    className="text-muted-foreground/50"
                                >
                                    ·
                                </span>
                            )}
                            {value}
                        </span>
                    ))}
            </p>
        </header>
    );
}
