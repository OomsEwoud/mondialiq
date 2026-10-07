import MatchLineupPlayerGroup from '@/components/matches/details/match-lineup-player-group';
import ImageWithFallback from '@/components/ui/display/image-with-fallback';
import type {
    MatchDetailsLineupTeam,
    MatchDetailsTeam,
} from '@/types/match-details';

type Props = {
    team: MatchDetailsTeam;
    lineup: MatchDetailsLineupTeam;
};

export default function MatchLineupTeamCard({ team, lineup }: Props) {
    return (
        <section className="min-w-0 rounded-md border border-border/70 bg-background/30 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    <ImageWithFallback
                        src={team.logo}
                        alt={team.name}
                        className="size-8 shrink-0 object-contain"
                    />
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-foreground">
                            {team.name}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            Formatie
                        </p>
                    </div>
                </div>
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                    {lineup.formation ?? '-'}
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-4">
                <MatchLineupPlayerGroup
                    title="Basiself"
                    players={lineup.starters}
                    teamName={team.name}
                    isStarting
                />
                <MatchLineupPlayerGroup
                    title="Wisselspelers"
                    players={lineup.substitutes}
                    teamName={team.name}
                />
            </div>
        </section>
    );
}
