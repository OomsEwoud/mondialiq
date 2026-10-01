import TeamCodeLink from '@/components/teams/team-code-link';
import type { Match } from '@/types/match';

interface Props {
    match: Match;
}

export default function PredictionMatchSummary({ match }: Props) {
    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-8">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
                <TeamCodeLink
                    id={match.homeTeamId}
                    code={match.homeTeamShort}
                    logo={match.homeTeamLogo}
                    name={match.homeTeam}
                />
                <span className="rounded-full border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground">
                    VS
                </span>
                <TeamCodeLink
                    id={match.awayTeamId}
                    code={match.awayTeamShort}
                    logo={match.awayTeamLogo}
                    name={match.awayTeam}
                    reverse
                />
            </div>

            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-left">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {match.round}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {match.date} &middot; {match.time}
                </p>
            </div>
        </div>
    );
}
